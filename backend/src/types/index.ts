export interface User {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'admin';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
}

export interface VotingPeriod {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  winnerRestaurantId?: string;
  isComplete: boolean;
  createdAt: Date;
}

export interface Vote {
  id: string;
  userId: string;
  restaurantId: string;
  votingPeriodId: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  votingPeriodId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  notes?: string;
  subtotal: number;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}
