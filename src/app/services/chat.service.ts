import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Observable, EMPTY } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Message } from '../models/message.model';

@Injectable({
	providedIn: 'root',
})
export class ChatService {
	private socket$: WebSocketSubject<any> | null = null;
	private apiUrl = 'http://' + environment.apiurl;

	constructor(private authService: AuthService, private http: HttpClient) {}

	connect(): void {
		const token = this.authService.getToken();
		if (token) {
			const url = `ws://${environment.apiurl}chat/ws?token=${token}`;
			this.socket$ = webSocket(url);
		}
	}

	sendMessage(message: any): void {
		if (this.socket$) {
			this.socket$.next(message);
		}
	}

	getMessages(): Observable<any> {
		if (this.socket$) {
			return this.socket$.asObservable();
		}
		return EMPTY;
	}

	disconnect(): void {
		if (this.socket$) {
			this.socket$.complete();
			this.socket$ = null;
		}
	}

	getChatHistory(username?: string): Observable<Message[]> {
		let url = `${this.apiUrl}chat/messages`;
		if (username) {
			url += `?username=${username}`;
		}
		return this.http.get<Message[]>(url);
	}

	getUnreadCount(): Observable<number> {
		return this.http.get<number>(`${this.apiUrl}chat/unread-count`);
	}

	getLastUnreadMessage(): Observable<Message> {
		return this.http.get<Message>(`${this.apiUrl}chat/last-unread`);
	}

	clearUserChatHistory(username: string): Observable<any> {
		return this.http.delete(`${this.apiUrl}admin/chat/history/${username}`);
	}
}
