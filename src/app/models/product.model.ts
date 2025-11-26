export interface Product {
	id?: string;
	name: string;
	price: number;
	timestamp?: string;
}

export interface ProductCreate {
	name: string;
	price: number;
}

export interface ProductUpdate {
	name?: string;
	price?: number;
}
