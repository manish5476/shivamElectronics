import { Component, OnInit } from '@angular/core';
import { CartService } from '../../../../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  removeFromCart(arg0: any) {
    throw new Error('Method not implemented.');
  }
  cartItems: any[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    // Load cart items from the service
    this.cartService.currentCart.subscribe((cart) => (this.cartItems = cart));
  }

  // Remove an item from the cart
  removeItem(id: string): void {
    this.cartService.removeFromCart(id);
  }

  // Update the quantity of a cart item
  updateCartItem(item: any): void {
    if (item.quantity < 1) {
      this.removeItem(item.product._id); // Remove item if quantity is zero or negative
    } else {
      this.cartService.updateCartItem(item.product._id, item.quantity);
    }
  }

  // Calculate total price of all cart items
  getTotalPrice(): number {
    return this.cartItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
  }
}
