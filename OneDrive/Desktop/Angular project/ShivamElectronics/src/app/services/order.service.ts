import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private baseUrl = 'http://localhost:3000/api/orders'; // Replace with your API URL

  constructor(private http: HttpClient) {}

  // Place a new order
  placeOrder(orderDetails: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, orderDetails);
  }

  // Get order details by order ID
  getOrderById(orderId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${orderId}`);
  }

  // Get all orders for a specific user (optional for order history)
  getUserOrders(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${userId}`);
  }
}
