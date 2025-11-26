import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { Product } from '../../models/product.model';

@Component({
	selector: 'app-menu',
	standalone: true,
	imports: [CommonModule, RouterLink],
	templateUrl: './menu.html',
	styleUrl: './menu.scss',
})
export class Menu implements OnInit {
	protected products = signal<Product[]>([]);
	protected loading = signal(true);
	protected error = signal<string | null>(null);

	constructor(private menuService: MenuService) {}

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

	protected formatPrice(price: number): string {
		return price.toFixed(2);
	}
}
