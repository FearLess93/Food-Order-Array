export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  tags: string[];
  imageUrl?: string;
}

export interface Group {
  id: string;
  ownerId: string;
  restaurantId: string;
  name: string;
  status: 'PUBLIC' | 'PRIVATE';
  joinCode?: string;
  startAt: string;
  endAt: string;
  isClosed: boolean;
  maxMembers?: number;
  owner: User;
  restaurant: Restaurant;
  members: GroupMember[];
  _count: {
    members: number;
  };
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  joinedAt: string;
  user: User;
}

export interface CartItem {
  id: string;
  cartId: string;
  menuItemId: string;
  quantity: number;
  addedAt: string;
  menuItem: MenuItem;
}

export interface Cart {
  id: string;
  groupId: string;
  userId: string;
  user: User;
  items: CartItem[];
}

export interface Payment {
  id: string;
  groupId: string;
  userId: string;
  status: 'UNPAID' | 'PENDING' | 'PAID';
  confirmedByOwner: boolean;
  confirmedAt?: string;
  user: User;
}
