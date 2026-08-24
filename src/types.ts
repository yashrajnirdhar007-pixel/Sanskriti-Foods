export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  variants: string[];
  stock: number;
  rating: number;
  reviews: number;
  ingredients?: string;
  taste?: string;
  shelfLife?: string;
  storage?: string;
  bestWith?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  customerDetails: {
    name: string;
    phone: string;
    address: string;
  };
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  date: string;
}
