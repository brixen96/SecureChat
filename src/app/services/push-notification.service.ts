import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  private VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY'; // This needs to be generated
  private apiUrl = 'http://' + environment.apiurl;
  private readonly permissionRequestedKey = 'notification_permission_requested';

  constructor(
    private http: HttpClient,
    private swPush: SwPush
  ) { }

  init(): void {
    if (this.swPush.isEnabled) {
      const permissionRequested = localStorage.getItem(this.permissionRequestedKey);
      if (!permissionRequested) {
        this.swPush.requestSubscription({
          serverPublicKey: this.VAPID_PUBLIC_KEY
        })
        .then(sub => {
          this.http.post(`${this.apiUrl}/subscriptions`, sub).subscribe();
          localStorage.setItem(this.permissionRequestedKey, 'true');
        })
        .catch(err => {
          console.error('Could not subscribe to notifications', err);
          localStorage.setItem(this.permissionRequestedKey, 'true'); // Also set flag if user denies
        });
      }
    }
  }
}
