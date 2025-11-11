import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { UnreadMessageService } from '../../../services/unread-message.service';
import { Message } from '../../../models/message.model';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss'
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  clearHistorySuccess = false;
  clearHistoryError: string | null = null;
  clearingHistoryFor: string | null = null;
  private messageSubscription: Subscription | undefined;
  private unreadCountSubscription: Subscription | undefined;
  private timerSubscription: Subscription | undefined;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private chatService: ChatService,
    private unreadMessageService: UnreadMessageService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.chatService.connect();

    this.messageSubscription = this.chatService.getMessages().subscribe((message: Message) => {
      this.loadUsers();
      this.unreadMessageService.updateUnreadCount();
    });

    this.unreadCountSubscription = interval(10000)
      .pipe(
        startWith(0),
        switchMap(() => this.unreadMessageService.updateUnreadCount())
      ).subscribe();

    this.timerSubscription = interval(60000).subscribe(() => {
      this.cd.markForCheck();
    });
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.unreadCountSubscription) {
      this.unreadCountSubscription.unsubscribe();
    }
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

	loadUsers(): void {
		this.userService.getUsers().subscribe((users) => {
			this.users = users
				.map(user => ({ ...user, expanded: false, notes: [], newNote: '' }))
				.sort((a, b) => {
					if (a.last_message_timestamp && b.last_message_timestamp) {
						return new Date(b.last_message_timestamp).getTime() - new Date(a.last_message_timestamp).getTime();
					} else if (a.last_message_timestamp) {
						return -1;
					} else if (b.last_message_timestamp) {
						return 1;
					} else {
						return 0;
					}
				});
		});
	}

	toggleExpand(user: User): void {
		user.expanded = !user.expanded;
		if (user.expanded) {
			this.getNotes(user);
		}
	}

	getNotes(user: User): void {
		this.userService.getNotes(user.username).subscribe(notes => {
			user.notes = notes;
		});
	}

	addNote(user: User): void {
		if (user.newNote) {
			this.userService.addNote(user.username, user.newNote).subscribe(() => {
				this.getNotes(user);
				user.newNote = '';
			});
		}
	}

	selectUser(user: User): void {
		this.router.navigate(['/admin/chat', user.username]);
		// After navigating, the chat component will mark messages as read.
		// We poll for unread count updates, so the list will update shortly.
	}

	  navigateToCreateUser(): void {
	    this.router.navigate(['/admin/users/new']);
	  }
	
	  onClearUserChatHistory(username: string): void {		if (confirm(`Are you sure you want to clear the chat history for ${username}? This action cannot be undone.`)) {
			this.clearingHistoryFor = username;
			this.clearHistoryError = null;
			this.clearHistorySuccess = false;

			this.chatService.clearUserChatHistory(username).subscribe({
				next: () => {
					this.clearHistorySuccess = true;
					setTimeout(() => {
						this.clearHistorySuccess = false;
						this.clearingHistoryFor = null;
					}, 3000);
				},
				error: (error: any) => {
					this.clearHistoryError = `Failed to clear chat history for ${username}: ${error.error.detail || 'Unknown error'}`;
					setTimeout(() => {
						this.clearHistoryError = null;
						this.clearingHistoryFor = null;
					}, 5000);
				},
			});
		}
	}

	logout(): void {
		this.authService.logout();
		this.router.navigate(['/login']);
	}

  timeSince(date: string): string {
    const parts = date.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (!parts) return date;

    const year = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10) - 1; // month is 0-indexed
    const day = parseInt(parts[3], 10);
    const hour = parseInt(parts[4], 10);
    const minute = parseInt(parts[5], 10);
    const second = parseInt(parts[6], 10);

    const utcDate = new Date(Date.UTC(year, month, day, hour, minute, second));

    const seconds = Math.floor((new Date().getTime() - utcDate.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) {
      return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  }
}
