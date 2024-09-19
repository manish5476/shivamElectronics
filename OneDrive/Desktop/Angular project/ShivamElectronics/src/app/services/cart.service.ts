import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  updateCartItem(_id: any, quantity: any) {
    throw new Error('Method not implemented.');
  }
  private cart = new BehaviorSubject<any[]>([]);
  currentCart = this.cart.asObservable();

  addToCart(product: any) {
    const updatedCart = [...this.cart.value, product];
    this.cart.next(updatedCart);
  }

  removeFromCart(productId: string) {
    const updatedCart = this.cart.value.filter((p) => p.id !== productId);
    this.cart.next(updatedCart);
  }
}
