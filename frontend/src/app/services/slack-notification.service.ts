import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SlackNotification {
  id: string;
  name: string;
  message: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class SlackNotificationService {
  private notificationsSubject = new BehaviorSubject<SlackNotification[]>([]);
  public notifications$: Observable<SlackNotification[]> = this.notificationsSubject.asObservable();
  private audio: HTMLAudioElement;
  private soundEnabled: boolean = true;

  constructor() {
    // Initialize audio element
    this.audio = new Audio('/assets/sfx/Slack New Message Sound.mp3');
    this.audio.preload = 'auto';
    this.audio.volume = 0.7; // Set a reasonable volume
  }

  addNotification(name: string, message: string): string {
    const id = this.generateId();
    const notification: SlackNotification = {
      id,
      name,
      message,
      timestamp: Date.now()
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);
    
    // Play sound effect
    this.playNotificationSound();
    
    return id;
  }

  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(filteredNotifications);
  }

  clearAllNotifications(): void {
    this.notificationsSubject.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  setVolume(volume: number): void {
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  private playNotificationSound(): void {
    if (!this.soundEnabled) {
      return;
    }

    try {
      // Reset audio to beginning in case it's already playing
      this.audio.currentTime = 0;
      this.audio.play().catch(error => {
        console.warn('Could not play notification sound:', error);
        // Silently fail - some browsers require user interaction before playing audio
      });
    } catch (error) {
      console.warn('Error playing notification sound:', error);
    }
  }
}
