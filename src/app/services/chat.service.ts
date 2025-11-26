import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Observable, EMPTY, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Message } from '../models/message.model';
import { filter, map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class ChatService {
	private socket$: WebSocketSubject<any> | null = null;
	private apiUrl = environment.apiurl;
	private typingIndicator$ = new Subject<boolean>();

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
			this.socket$.next({ type: 'message', ...message });
		}
	}

	sendTypingIndicator(isTyping: boolean, recipient?: string): void {
		if (this.socket$) {
			const payload: any = { type: 'typing', isTyping };
			if (recipient) {
				payload.recipient = recipient;
			}
			this.socket$.next(payload);
		}
	}

	sendTypingIndicatorWithRecipient(isTyping: boolean, recipient: string): void {
		this.sendTypingIndicator(isTyping, recipient);
	}

	getMessages(): Observable<any> {
		if (this.socket$) {
			return this.socket$.asObservable().pipe(
				filter((msg: any) => !msg.type || msg.type === 'message'),
				map((msg: any) => {
					if (msg.type === 'message') {
						const { type, ...message } = msg;
						return message;
					}
					return msg;
				})
			);
		}
		return EMPTY;
	}

	getTypingIndicator(): Observable<boolean> {
		if (this.socket$) {
			this.socket$
				.asObservable()
				.pipe(filter((msg: any) => msg.type === 'typing'))
				.subscribe((msg: any) => {
					this.typingIndicator$.next(msg.isTyping);
				});
		}
		return this.typingIndicator$.asObservable();
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
