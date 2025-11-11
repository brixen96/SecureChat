import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Message } from '../../models/message.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.scss'
})
export class Chat implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageList') private messageListContainer!: ElementRef;
  messages: Message[] = [];
  messageForm: FormGroup;
  private messageSubscription: Subscription | undefined;
  currentUsername: string | null = null;

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private chatService: ChatService, 
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.messageForm = this.fb.group({
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.notificationService.requestPermission();
    this.currentUsername = this.authService.getUsername();
    this.chatService.getChatHistory().subscribe(history => {
      this.messages = history;
      this.scrollToBottom();
    });
    this.chatService.connect();
    this.messageSubscription = this.chatService.getMessages().subscribe((message: Message) => {
      this.messages.push(message);
      this.scrollToBottom();
      if (message.sender !== this.currentUsername) {
        if (document.hidden) {
          // Badge is handled globally
        }
        this.notificationService.showNotification('New Message', {
          body: message.text,
          icon: 'assets/icons/icon-192x192.png'
        });
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.messageListContainer.nativeElement.scrollTop = this.messageListContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.chatService.disconnect();
  }

  sendMessage(): void {
    if (this.messageForm.valid) {
      const messageText = this.messageForm.value.message;
      const messagePayload = { text: messageText };
      this.chatService.sendMessage(messagePayload);
      this.messageForm.reset();
      this.scrollToBottom();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
