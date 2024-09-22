import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Product } from './products';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);

  items: Product[] = [];

  addToCart(product: Product) {
    this.items.push(product);
  }

  getItems() {
    return this.items;
  }

  clearCart() {
    this.items = [];
    return this.items;
  }

  getShippingPrices() {
    return this.http.get<{ type: string; price: number }[]>(
      '/assets/shipping.json'
    );
  }
}
