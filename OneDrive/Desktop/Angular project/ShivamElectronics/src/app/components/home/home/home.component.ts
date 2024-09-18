import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  searchQuery: string = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Load products on component initialization
    this.productService.getProducts().subscribe((data) => {
      this.products = data;
      this.filteredProducts = this.products;
    });
  }

  // Filter products based on the search query
  filterProducts(): void {
    this.filteredProducts = this.products.filter((product) =>
      product.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // Add product to cart
  addToCart(product: any): void {
    this.cartService.addToCart(product);
  }
}
