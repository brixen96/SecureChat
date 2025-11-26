import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSound: HTMLAudioElement | null = null;
  private soundEnabled = true;

  constructor() {
    this.initializeSound();
  }

  private initializeSound(): void {
    try {
      this.notificationSound = new Audio();
      this.notificationSound.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSBQJT6Xj8bllHAU2jdXyzn4tBSl+zPH';
      this.notificationSound.volume = 0.5;
    } catch (error) {
      console.warn('Could not initialize notification sound', error);
    }
  }

  requestPermission(): void {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }

  playSound(): void {
    if (this.soundEnabled && this.notificationSound) {
      this.notificationSound.currentTime = 0;
      this.notificationSound.play().catch(err => {
        console.warn('Could not play notification sound', err);
      });
    }
  }

  vibrate(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }

  showNotification(title: string, options?: NotificationOptions): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notificationOptions: NotificationOptions = {
        ...options,
        badge: options?.icon,
        tag: 'securechat-message',
        requireInteraction: false,
      };

      const notification = new Notification(title, notificationOptions);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      this.playSound();
      this.vibrate();
    } else if (document.hidden) {
      this.playSound();
      this.vibrate();
    }
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }
}
