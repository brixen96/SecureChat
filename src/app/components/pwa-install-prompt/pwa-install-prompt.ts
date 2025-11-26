import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaInstallService } from '../../services/pwa-install.service';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-pwa-install-prompt',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './pwa-install-prompt.html',
	styleUrl: './pwa-install-prompt.scss',
})
export class PwaInstallPrompt implements OnInit, OnDestroy {
	protected showPrompt = signal(false);
	protected showInstructions = signal(false);
	protected installing = signal(false);
	protected instructions: { platform: string; instructions: string[] } | null = null;
	private installSubscription?: Subscription;

	constructor(
		private pwaInstallService: PwaInstallService,
		private notificationService: NotificationService
	) {}

	ngOnInit(): void {
		// Listen for install prompt availability
		this.installSubscription = this.pwaInstallService.getInstallPromptObservable().subscribe(() => {
			if (this.pwaInstallService.shouldShowInstallPrompt()) {
				this.showPrompt.set(true);
			}
		});

		// If already can install, show prompt
		if (this.pwaInstallService.canInstall() && this.pwaInstallService.shouldShowInstallPrompt()) {
			setTimeout(() => {
				this.showPrompt.set(true);
			}, 5000);
		}
	}

	ngOnDestroy(): void {
		this.installSubscription?.unsubscribe();
	}

	async onInstall(): Promise<void> {
		this.installing.set(true);

		const installed = await this.pwaInstallService.promptInstall();

		if (installed) {
			this.showPrompt.set(false);
			// Request notification permission after install
			setTimeout(() => {
				this.requestNotifications();
			}, 1000);
		} else {
			// Show manual instructions if prompt failed (likely iOS)
			this.instructions = this.pwaInstallService.getInstallInstructions();
			this.showInstructions.set(true);
		}

		this.installing.set(false);
	}

	onDismiss(): void {
		this.pwaInstallService.dismissInstallPrompt();
		this.showPrompt.set(false);
	}

	showManualInstructions(): void {
		this.instructions = this.pwaInstallService.getInstallInstructions();
		this.showInstructions.set(true);
	}

	closeInstructions(): void {
		this.showInstructions.set(false);
		this.showPrompt.set(false);
		this.pwaInstallService.dismissInstallPrompt();
	}

	private requestNotifications(): void {
		if ('Notification' in window && Notification.permission === 'default') {
			this.notificationService.requestPermission();
		}
	}
}
