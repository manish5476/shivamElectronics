import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-new-product',
  templateUrl: './new-product.component.html',
  styleUrl: './new-product.component.scss',
})
export class NewProductComponent implements OnInit {
  productForm: FormGroup;

  constructor(private fb: FormBuilder, private productService: ProductService) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      brand: ['', Validators.required],
      price: ['', Validators.required],
      description: ['', Validators.required],
      stock: ['', Validators.required],
      category: ['', Validators.required],
      features: this.fb.array([]),
      images: this.fb.array([]),
      reviews: this.fb.array([]),
    });
  }

  ngOnInit(): void {}

  get features() {
    return this.productForm.get('features') as FormArray;
  }

  get images() {
    return this.productForm.get('images') as FormArray;
  }

  get reviews() {
    return this.productForm.get('reviews') as FormArray;
  }

  addFeature() {
    this.features.push(this.fb.control(''));
  }

  removeFeature(index: number) {
    this.features.removeAt(index);
  }

  addImage() {
    this.images.push(this.fb.control(''));
  }

  removeImage(index: number) {
    this.images.removeAt(index);
  }

  addReview() {
    this.reviews.push(
      this.fb.group({
        user: ['', Validators.required],
        rating: [null, Validators.required],
        comment: ['', Validators.required],
        date: ['', Validators.required],
      })
    );
  }

  removeReview(index: number) {
    this.reviews.removeAt(index);
  }

  onSubmit() {
    if (this.productForm.valid) {
      console.log('Product Form Data:', this.productForm.value);
      this.productService
        .createProduct(this.productForm.value)
        .subscribe((response) => {
          console.log('Product added successfully:', response);
        });
    }
  }
}
