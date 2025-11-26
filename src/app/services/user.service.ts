import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private apiUrl = environment.apiurl;

	constructor(private http: HttpClient) {}

	getUsers(): Observable<User[]> {
		return this.http.get<User[]>(`${this.apiUrl}users/`, {
			headers: { 'Cache-Control': 'no-cache' },
		});
	}

	createUser(username: string): Observable<{ username: string; password: string }> {
		return this.http.post<{ username: string; password: string }>(`${this.apiUrl}admin/users`, { username });
	}

	getServerTime(): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}users/time`);
	}

	getNotes(username: string): Observable<any[]> {
		return this.http.get<any[]>(`${this.apiUrl}admin/users/${username}/notes`);
	}

	addNote(username: string, content: string): Observable<any> {
		return this.http.post<any>(`${this.apiUrl}admin/users/${username}/notes`, { content });
	}
}
