import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PushNotificationService } from './services/push-notification.service';
import { PwaInstallPrompt } from './components/pwa-install-prompt/pwa-install-prompt';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PwaInstallPrompt],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('SecureChat');

  constructor(private pushNotificationService: PushNotificationService) {}

  ngOnInit(): void {
    this.pushNotificationService.init();
  }
}