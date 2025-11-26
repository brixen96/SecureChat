import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, ProductCreate, ProductUpdate } from '../models/product.model';

@Injectable({
	providedIn: 'root',
})
export class MenuService {
	private apiUrl = environment.apiurl;

	constructor(private http: HttpClient) {}

	getAllProducts(): Observable<Product[]> {
		return this.http.get<Product[]>(`${this.apiUrl}menu`);
	}

	createProduct(product: ProductCreate): Observable<Product> {
		return this.http.post<Product>(`${this.apiUrl}menu`, product);
	}

	updateProduct(productId: string, product: ProductUpdate): Observable<Product> {
		return this.http.put<Product>(`${this.apiUrl}menu/${productId}`, product);
	}

	deleteProduct(productId: string): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}menu/${productId}`);
	}
}
