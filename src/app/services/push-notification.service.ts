import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class PushNotificationService {
	private VAPID_PUBLIC_KEY = 'BF8nb-w_hSCaoPSgtE6URzzZhMgW4vBiDWFLvGQxD619X9-kFcHt5I9EgpxbTB1yUon6P_p0m2BGzyFEYv5ecfU';
	private apiUrl = environment.apiurl;
	private readonly permissionRequestedKey = 'notification_permission_requested';

	constructor(private http: HttpClient, private swPush: SwPush) {}

	init(): void {
		if (this.swPush.isEnabled) {
			// Listen for push messages
			this.swPush.messages.subscribe((message: any) => {
				console.log('Push message received:', message);
				this.showNotification(message);
			});

			// Listen for notification clicks
			this.swPush.notificationClicks.subscribe(({ action, notification }) => {
				console.log('Notification clicked:', action, notification);
				window.focus();
			});

			// Request subscription
			const permissionRequested = localStorage.getItem(this.permissionRequestedKey);
			if (!permissionRequested) {
				this.requestSubscription();
			}
		}
	}

	private requestSubscription(): void {
		this.swPush
			.requestSubscription({
				serverPublicKey: this.VAPID_PUBLIC_KEY,
			})
			.then((sub) => {
				console.log('Push subscription created:', sub);
				this.http.post(`${this.apiUrl}subscriptions`, sub).subscribe({
					next: () => {
						console.log('Subscription saved to server');
						localStorage.setItem(this.permissionRequestedKey, 'true');
					},
					error: (err) => {
						console.error('Could not save subscription to server', err);
					},
				});
			})
			.catch((err) => {
				console.error('Could not subscribe to notifications', err);
				localStorage.setItem(this.permissionRequestedKey, 'true');
			});
	}

	private showNotification(message: any): void {
		const title = message.title || 'New Message';
		const options: NotificationOptions = {
			body: message.body || 'You have a new message',
			icon: '/assets/icons/icon-192x192.png',
			badge: '/assets/icons/icon-72x72.png',
			tag: 'securechat-message',
			requireInteraction: false,
		};

		if ('Notification' in window && Notification.permission === 'granted') {
			new Notification(title, options);
			// Vibrate separately
			if ('vibrate' in navigator) {
				navigator.vibrate([200, 100, 200]);
			}
		}
	}

	public requestPermission(): void {
		if (!this.swPush.isEnabled) {
			console.warn('Service Worker is not enabled');
			return;
		}
		this.requestSubscription();
	}
}
