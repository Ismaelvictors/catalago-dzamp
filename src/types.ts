export type Category = 'infantil' | 'jovem_adulto' | 'protecao_uv';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  images: string[];
  sizes: string[];
}

export interface CartItem {
  key: string;
  productId: string;
  title: string;
  price: number;
  size: string;
  note: string;
  qty: number;
  image: string;
}
