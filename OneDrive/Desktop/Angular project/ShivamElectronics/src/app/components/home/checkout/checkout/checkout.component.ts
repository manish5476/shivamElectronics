import { Component, OnInit } from '@angular/core';
import { CartService } from '../../../../services/cart.service';
import { OrderService } from '../../../../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  cartItems: any[] = [];
  checkoutData = {
    fullName: '',
    shippingAddress: '',
    paymentMethod: 'stripe',
  };

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load cart items from the service
    this.cartService.currentCart.subscribe((cart) => (this.cartItems = cart));
  }

  // Place the order and capture payment
  placeOrder(): void {
    const orderDetails = {
      cartItems: this.cartItems,
      fullName: this.checkoutData.fullName,
      shippingAddress: this.checkoutData.shippingAddress,
      paymentMethod: this.checkoutData.paymentMethod,
      totalPrice: this.getTotalPrice(),
    };

    // Place the order through the OrderService
    this.orderService.placeOrder(orderDetails).subscribe((response) => {
      if (response.success) {
        // Navigate to order confirmation page after successful order placement
        this.router.navigate(['/order-confirmation']);
      }
    });
  }

  // Calculate total price of all cart items
  getTotalPrice(): number {
    return this.cartItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
  }
}

// import { Component, OnInit } from '@angular/core';
// import { CartService } from '../../../../services/cart.service';
// import { OrderService } from '../../../../services/order.service';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-checkout',
//   templateUrl: './checkout.component.html',
//   styleUrls: ['./checkout.component.css'],
// })
// export class CheckoutComponent implements OnInit {
//   cartItems: any[] = [];
//   checkoutData = {
//     fullName: '',
//     shippingAddress: '',
//     paymentMethod: 'stripe',
//   };

//   constructor(
//     private cartService: CartService,
//     private orderService: OrderService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     // Load cart items from the service
//     this.cartService.currentCart.subscribe((cart) => (this.cartItems = cart));
//   }

//   // Place the order and capture payment
//   placeOrder(): void {
//     const orderDetails = {
//       cartItems: this.cartItems,
//       fullName: this.checkoutData.fullName,
//       shippingAddress: this.checkoutData.shippingAddress,
//       paymentMethod: this.checkoutData.paymentMethod,
//       totalPrice: this.getTotalPrice(),
//     };

//     this.orderService.placeOrder(orderDetails).subscribe((response) => {
//       if (response.success) {
//         this.router.navigate(['/order-confirmation']);
//       }
//     });
//   }

//   // Calculate total price of all cart items
//   getTotalPrice(): number {
//     return this.cartItems.reduce(
//       (acc, item) => acc + item.product.price * item.quantity,
//       0
//     );
//   }
// }
