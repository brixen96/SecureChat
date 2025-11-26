import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuService } from '../../../services/menu.service';
import { Product, ProductCreate } from '../../../models/product.model';

@Component({
	selector: 'app-admin-menu',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, RouterLink],
	templateUrl: './menu.html',
	styleUrl: './menu.scss',
})
export class AdminMenu implements OnInit {
	protected products = signal<Product[]>([]);
	protected loading = signal(true);
	protected error = signal<string | null>(null);
	protected showAddForm = signal(false);
	protected editingProduct = signal<Product | null>(null);
	protected saving = signal(false);

	productForm: FormGroup;

	constructor(
		private menuService: MenuService,
		private fb: FormBuilder
	) {
		this.productForm = this.fb.group({
			name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
			price: [0, [Validators.required, Validators.min(0.01)]],
		});
	}

	ngOnInit(): void {
		this.loadProducts();
	}

	private loadProducts(): void {
		this.loading.set(true);
		this.error.set(null);

		this.menuService.getAllProducts().subscribe({
			next: (products) => {
				this.products.set(products);
				this.loading.set(false);
			},
			error: (err) => {
				console.error('Error loading menu:', err);
				this.error.set('Failed to load menu. Please try again later.');
				this.loading.set(false);
			},
		});
	}

	protected showAddProductForm(): void {
		this.showAddForm.set(true);
		this.editingProduct.set(null);
		this.productForm.reset({ name: '', price: 0 });
	}

	protected hideForm(): void {
		this.showAddForm.set(false);
		this.editingProduct.set(null);
		this.productForm.reset();
	}

	protected editProduct(product: Product): void {
		this.editingProduct.set(product);
		this.showAddForm.set(true);
		this.productForm.patchValue({
			name: product.name,
			price: product.price,
		});
	}

	protected saveProduct(): void {
		if (this.productForm.invalid || this.saving()) {
			return;
		}

		this.saving.set(true);
		const formValue = this.productForm.value;

		if (this.editingProduct()) {
			// Update existing product
			const productId = this.editingProduct()!.id!;
			this.menuService.updateProduct(productId, formValue).subscribe({
				next: (updatedProduct) => {
					const currentProducts = this.products();
					const index = currentProducts.findIndex((p) => p.id === productId);
					if (index !== -1) {
						currentProducts[index] = updatedProduct;
						this.products.set([...currentProducts]);
					}
					this.hideForm();
					this.saving.set(false);
				},
				error: (err) => {
					console.error('Error updating product:', err);
					this.error.set('Failed to update product. Please try again.');
					this.saving.set(false);
				},
			});
		} else {
			// Create new product
			const newProduct: ProductCreate = {
				name: formValue.name,
				price: formValue.price,
			};

			this.menuService.createProduct(newProduct).subscribe({
				next: (createdProduct) => {
					this.products.set([createdProduct, ...this.products()]);
					this.hideForm();
					this.saving.set(false);
				},
				error: (err) => {
					console.error('Error creating product:', err);
					this.error.set('Failed to create product. Please try again.');
					this.saving.set(false);
				},
			});
		}
	}

	protected deleteProduct(product: Product): void {
		if (!product.id) return;

		if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
			return;
		}

		this.menuService.deleteProduct(product.id).subscribe({
			next: () => {
				this.products.set(this.products().filter((p) => p.id !== product.id));
			},
			error: (err) => {
				console.error('Error deleting product:', err);
				this.error.set('Failed to delete product. Please try again.');
			},
		});
	}

	protected formatPrice(price: number): string {
		return price.toFixed(2);
	}
}
