import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ChatService } from './chat.service';
import { BadgeService } from './badge.service';

@Injectable({
  providedIn: 'root'
})
export class UnreadMessageService {

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$: Observable<number> = this.unreadCountSubject.asObservable();

  constructor(private chatService: ChatService, private badgeService: BadgeService) { }

  updateUnreadCount(): Observable<number> {
    return this.chatService.getUnreadCount().pipe(
      tap(count => {
        this.unreadCountSubject.next(count);
        if (count > 0) {
          this.badgeService.setAppBadge(count);
        } else {
          this.badgeService.clearAppBadge();
        }
      })
    );
  }
}
