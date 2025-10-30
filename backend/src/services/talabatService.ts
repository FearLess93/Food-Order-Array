import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';
import { CustomError } from '../middleware/errorHandler';

interface TalabatRestaurant {
  id: string;
  name: string;
  cuisine: string[];
  logo: string;
  rating: number;
  deliveryTime: string;
  minimumOrder: number;
  deliveryFee: number;
  isOpen: boolean;
}

interface TalabatMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
}

interface TalabatOrderRequest {
  restaurantId: string;
  items: Array<{
    itemId: string;
    quantity: number;
    specialInstructions?: string;
  }>;
  deliveryAddress: {
    street: string;
    building: string;
    floor?: string;
    apartment?: string;
    city: string;
    area: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contactPhone: string;
  paymentMethod: 'cash' | 'card';
  scheduledTime?: string;
}

interface TalabatOrderResponse {
  orderId: string;
  status: string;
  estimatedDeliveryTime: string;
  totalAmount: number;
  trackingUrl: string;
}

export class TalabatService {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.TALABAT_API_KEY || '';
    this.baseUrl = process.env.TALABAT_API_URL || 'https://api.talabat.com/v1';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new CustomError(
            error.response.data.message || 'Talabat API error',
            error.response.status,
            'TALABAT_API_ERROR',
            error.response.data
          );
        }
        throw new CustomError('Failed to connect to Talabat', 503, 'TALABAT_CONNECTION_ERROR');
      }
    );
  }

  /**
   * Get list of available restaurants in Bahrain
   */
  async getRestaurants(params?: {
    city?: string;
    cuisine?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<TalabatRestaurant[]> {
    try {
      const response = await this.client.get('/restaurants', {
        params: {
          country: 'BH', // Bahrain
          ...params,
        },
      });

      return response.data.restaurants || [];
    } catch (error) {
      console.error('Error fetching Talabat restaurants:', error);
      throw error;
    }
  }

  /**
   * Get restaurant details by ID
   */
  async getRestaurantDetails(restaurantId: string): Promise<TalabatRestaurant> {
    try {
      const response = await this.client.get(`/restaurants/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      throw error;
    }
  }

  /**
   * Get restaurant menu
   */
  async getRestaurantMenu(restaurantId: string): Promise<TalabatMenuItem[]> {
    try {
      const response = await this.client.get(`/restaurants/${restaurantId}/menu`);
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching restaurant menu:', error);
      throw error;
    }
  }

  /**
   * Place an order through Talabat
   */
  async placeOrder(orderData: TalabatOrderRequest): Promise<TalabatOrderResponse> {
    try {
      const response = await this.client.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error placing Talabat order:', error);
      throw error;
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<{
    orderId: string;
    status: string;
    estimatedDeliveryTime: string;
    driverLocation?: {
      latitude: number;
      longitude: number;
    };
  }> {
    try {
      const response = await this.client.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order status:', error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.post(`/orders/${orderId}/cancel`, {
        reason: reason || 'Customer request',
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  /**
   * Sync restaurant data from Talabat to local database
   */
  async syncRestaurant(talabatRestaurantId: string): Promise<{
    restaurant: any;
    menuItems: any[];
  }> {
    try {
      // Get restaurant details
      const restaurantDetails = await this.getRestaurantDetails(talabatRestaurantId);
      
      // Get menu
      const menuItems = await this.getRestaurantMenu(talabatRestaurantId);

      // Import models
      const { RestaurantModel } = await import('../models/Restaurant');
      const { MenuItemModel } = await import('../models/MenuItem');

      // Create or update restaurant in local database
      const restaurant = await RestaurantModel.create(
        restaurantDetails.name,
        restaurantDetails.cuisine.join(', '),
        restaurantDetails.logo
      );

      // Store Talabat restaurant ID for reference
      // You might want to add a talabat_id field to the restaurants table

      // Sync menu items
      const menuItemsData = menuItems.map(item => ({
        restaurantId: restaurant.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        imageUrl: item.image,
      }));

      const syncedMenuItems = await MenuItemModel.bulkCreate(menuItemsData);

      return {
        restaurant,
        menuItems: syncedMenuItems,
      };
    } catch (error) {
      console.error('Error syncing restaurant from Talabat:', error);
      throw error;
    }
  }

  /**
   * Place a group order through Talabat
   * Aggregates multiple employee orders into one Talabat order
   */
  async placeGroupOrder(params: {
    restaurantId: string;
    talabatRestaurantId: string;
    orders: Array<{
      employeeName: string;
      items: Array<{
        talabatItemId: string;
        quantity: number;
        notes?: string;
      }>;
    }>;
    deliveryAddress: TalabatOrderRequest['deliveryAddress'];
    contactPhone: string;
    paymentMethod: 'cash' | 'card';
  }): Promise<TalabatOrderResponse> {
    try {
      // Aggregate all items from all orders
      const aggregatedItems = new Map<string, { quantity: number; notes: string[] }>();

      params.orders.forEach(order => {
        order.items.forEach(item => {
          const existing = aggregatedItems.get(item.talabatItemId);
          if (existing) {
            existing.quantity += item.quantity;
            if (item.notes) {
              existing.notes.push(`${order.employeeName}: ${item.notes}`);
            }
          } else {
            aggregatedItems.set(item.talabatItemId, {
              quantity: item.quantity,
              notes: item.notes ? [`${order.employeeName}: ${item.notes}`] : [],
            });
          }
        });
      });

      // Convert to Talabat order format
      const talabatItems = Array.from(aggregatedItems.entries()).map(([itemId, data]) => ({
        itemId,
        quantity: data.quantity,
        specialInstructions: data.notes.length > 0 ? data.notes.join('; ') : undefined,
      }));

      // Place order
      const orderResponse = await this.placeOrder({
        restaurantId: params.talabatRestaurantId,
        items: talabatItems,
        deliveryAddress: params.deliveryAddress,
        contactPhone: params.contactPhone,
        paymentMethod: params.paymentMethod,
      });

      return orderResponse;
    } catch (error) {
      console.error('Error placing group order:', error);
      throw error;
    }
  }

  /**
   * Check if Talabat integration is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && !!this.baseUrl;
  }
}

// Export singleton instance
export const talabatService = new TalabatService();
