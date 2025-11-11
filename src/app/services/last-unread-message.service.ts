import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ChatService } from './chat.service';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class LastUnreadMessageService {

  private lastUnreadMessageSubject = new BehaviorSubject<Message | null>(null);
  public lastUnreadMessage$: Observable<Message | null> = this.lastUnreadMessageSubject.asObservable();

  constructor(private chatService: ChatService) { }

  updateLastUnreadMessage(): Observable<Message> {
    return this.chatService.getLastUnreadMessage().pipe(
      tap(message => {
        this.lastUnreadMessageSubject.next(message);
      })
    );
  }
}
