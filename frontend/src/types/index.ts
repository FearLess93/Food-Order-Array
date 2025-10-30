export interface User {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'admin';
  isVerified: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface VotingResults {
  date: string;
  restaurants: Array<{
    restaurant: Restaurant;
    voteCount: number;
  }>;
  winner?: Restaurant;
  isComplete: boolean;
  totalVotes: number;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  status: string;
  totalAmount: number;
  items: Array<{
    menuItem: MenuItem;
    quantity: number;
    notes?: string;
    subtotal: number;
  }>;
  createdAt: string;
}

export interface GroupOrder {
  date: string;
  restaurant: {
    id: string;
    name: string;
    cuisine: string;
  };
  orders: Array<{
    user: User;
    items: Array<{
      menuItem: MenuItem;
      quantity: number;
      notes?: string;
      subtotal: number;
    }>;
    totalAmount: number;
  }>;
  totalOrders: number;
  totalAmount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}
