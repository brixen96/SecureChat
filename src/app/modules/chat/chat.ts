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
  @ViewChild('messageInput') private messageInput!: ElementRef;
  messages: Message[] = [];
  messageForm: FormGroup;
  private messageSubscription: Subscription | undefined;
  private typingSubscription: Subscription | undefined;
  currentUsername: string | null = null;
  isTyping = false;
  isSending = false;
  private typingTimeout: any;

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

    this.typingSubscription = this.chatService.getTypingIndicator().subscribe((typing: boolean) => {
      this.isTyping = typing;
      if (typing) {
        this.scrollToBottom();
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
    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    this.chatService.disconnect();
  }

  onTyping(): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    this.chatService.sendTypingIndicator(true);

    this.typingTimeout = setTimeout(() => {
      this.chatService.sendTypingIndicator(false);
    }, 1000);
  }

  sendMessage(): void {
    if (this.messageForm.valid && !this.isSending) {
      this.isSending = true;
      const messageText = this.messageForm.value.message;
      const messagePayload = { text: messageText };

      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
      this.chatService.sendTypingIndicator(false);

      this.chatService.sendMessage(messagePayload);
      this.messageForm.reset();

      setTimeout(() => {
        this.isSending = false;
        this.scrollToBottom();
      }, 300);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
