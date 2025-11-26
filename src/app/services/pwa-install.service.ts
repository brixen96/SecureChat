import { Injectable, signal } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';

interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Injectable({
	providedIn: 'root',
})
export class PwaInstallService {
	private deferredPrompt: BeforeInstallPromptEvent | null = null;
	private installPromptShown = signal(false);
	public canInstall = signal(false);
	public isInstalled = signal(false);
	public isStandalone = signal(false);
	private installSubject = new Subject<void>();

	constructor() {
		this.checkIfInstalled();
		this.listenForInstallPrompt();
	}

	private checkIfInstalled(): void {
		// Check if app is running in standalone mode (installed)
		const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone || document.referrer.includes('android-app://');

		this.isStandalone.set(isStandalone);
		this.isInstalled.set(isStandalone);
	}

	private listenForInstallPrompt(): void {
		fromEvent<BeforeInstallPromptEvent>(window, 'beforeinstallprompt').subscribe((event) => {
			// Prevent the default prompt
			event.preventDefault();

			// Store the event for later use
			this.deferredPrompt = event;
			this.canInstall.set(true);

			// Show our custom install prompt after a delay
			setTimeout(() => {
				if (!this.installPromptShown() && !this.isInstalled()) {
					this.installSubject.next();
				}
			}, 5000); // Show after 5 seconds
		});

		// Listen for app installation
		fromEvent(window, 'appinstalled').subscribe(() => {
			this.isInstalled.set(true);
			this.canInstall.set(false);
			this.deferredPrompt = null;
		});
	}

	async promptInstall(): Promise<boolean> {
		if (!this.deferredPrompt) {
			return false;
		}

		// Show the install prompt
		await this.deferredPrompt.prompt();

		// Wait for the user to respond
		const { outcome } = await this.deferredPrompt.userChoice;

		// Clear the deferred prompt
		this.deferredPrompt = null;
		this.canInstall.set(false);

		return outcome === 'accepted';
	}

	getInstallPromptObservable() {
		return this.installSubject.asObservable();
	}

	dismissInstallPrompt(): void {
		this.installPromptShown.set(true);
		localStorage.setItem('pwa-install-dismissed', Date.now().toString());
	}

	shouldShowInstallPrompt(): boolean {
		if (this.isInstalled() || !this.canInstall()) {
			return false;
		}

		const dismissed = localStorage.getItem('pwa-install-dismissed');
		if (dismissed) {
			const dismissedTime = parseInt(dismissed, 10);
			const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
			// Don't show again for 7 days after dismissal
			return daysSinceDismissed > 7;
		}

		return true;
	}

	getInstallInstructions(): { platform: string; instructions: string[] } {
		const userAgent = window.navigator.userAgent.toLowerCase();
		const isIOS = /iphone|ipad|ipod/.test(userAgent);
		const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);

		if (isIOS || isSafari) {
			return {
				platform: 'iOS/Safari',
				instructions: [
					'Tap the Share button (square with arrow)',
					'Scroll down and tap "Add to Home Screen"',
					'Tap "Add" in the top right corner',
					"You'll find SecureChat on your home screen!",
				],
			};
		}

		return {
			platform: 'Android/Chrome',
			instructions: ['Tap the menu button (three dots)', 'Tap "Add to Home Screen" or "Install app"', 'Tap "Install" or "Add"', "You'll find SecureChat on your home screen!"],
		};
	}
}
