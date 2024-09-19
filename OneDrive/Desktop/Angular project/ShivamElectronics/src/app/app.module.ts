import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home/home.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CartComponent } from './components/home/cart/cart/cart.component';
import { ProductDetailsComponent } from './components/home/product-details/product-details/product-details.component';
import { CheckoutComponent } from './components/home/checkout/checkout/checkout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card'; // Import MatCardModule

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';

import { MatFormFieldModule } from '@angular/material/form-field'; // Import MatFormFieldModule

import { MatInputModule } from '@angular/material/input'; // Import MatInputModule
import { MatOptionModule } from '@angular/material/core';
import { NewProductComponent } from './components/home/new-product/new-product.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CartComponent,
    ProductDetailsComponent,
    CheckoutComponent,
    NewProductComponent,
  ],
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    MatOptionModule,
    BrowserModule,
    FormsModule,
    MatCardModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule, // Add MatFormFieldModule to imports
    MatInputModule,
    AppRoutingModule,
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    // provideHttpClient() removed
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
