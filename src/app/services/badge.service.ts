import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BadgeService {

  constructor() { }

  setAppBadge(count: number): void {
    if ('setAppBadge' in navigator) {
      navigator.setAppBadge(count);
    }
  }

  clearAppBadge(): void {
    if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge();
    }
  }
}
