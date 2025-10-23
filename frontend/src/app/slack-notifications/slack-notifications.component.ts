import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SlackMessageComponent } from '../slack-message/slack-message.component';
import { SlackNotificationService, SlackNotification } from '../services/slack-notification.service';

@Component({
  selector: 'app-slack-notifications',
  standalone: true,
  imports: [CommonModule, SlackMessageComponent],
  templateUrl: './slack-notifications.component.html',
  styleUrl: './slack-notifications.component.css'
})
export class SlackNotificationsComponent implements OnInit, OnDestroy {
  notifications: SlackNotification[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: SlackNotificationService) {}

  ngOnInit() {
    this.subscription = this.notificationService.notifications$.subscribe(
      notifications => {
        this.notifications = notifications;
      }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onDismiss(id: string) {
    this.notificationService.removeNotification(id);
  }
}
