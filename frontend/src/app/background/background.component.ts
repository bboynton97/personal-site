import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackgroundAnimationService } from '../services/background-animation.service';
import { Subscription } from 'rxjs';
import { CountdownTimerComponent } from '../countdown-timer/countdown-timer.component';
import { ShareholderValueComponent } from '../shareholder-value/shareholder-value.component';

@Component({
  selector: 'app-background',
  standalone: true,
  imports: [CommonModule, CountdownTimerComponent, ShareholderValueComponent],
  templateUrl: './background.component.html',
  styleUrl: './background.component.css'
})
export class BackgroundComponent implements OnInit, OnDestroy {
  @ViewChild(CountdownTimerComponent) countdownTimer!: CountdownTimerComponent;
  @ViewChild(ShareholderValueComponent) shareholderValue!: ShareholderValueComponent;
  
  lightningActive = false;
  alarmActive = false;
  private subscriptions: Subscription[] = [];
  private explosionSound: HTMLAudioElement | null = null;
  private alarmSound: HTMLAudioElement | null = null;

  constructor(private backgroundAnimationService: BackgroundAnimationService) {
    this.initializeExplosionSound();
    this.initializeAlarmSound();
  }

  ngOnInit(): void {
    // Subscribe to animation triggers
    this.subscriptions.push(
      this.backgroundAnimationService.animationTrigger$.subscribe(animationName => {
        this.triggerAnimation(animationName);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeExplosionSound(): void {
    this.explosionSound = new Audio();
    this.explosionSound.src = 'assets/sfx/Explosion Sound Effect.mp3';
    this.explosionSound.volume = 0.7;
  }

  private initializeAlarmSound(): void {
    this.alarmSound = new Audio();
    this.alarmSound.src = 'assets/sfx/Tarkov Reserve Alarm Sound Effect.mp3';
    this.alarmSound.volume = 0.8;
  }

  /**
   * Triggers the lightning animation
   */
  triggerLightning(): void {
    this.lightningActive = true;
    this.playExplosionSound();
    
    // Reset animation after it completes
    setTimeout(() => {
      this.lightningActive = false;
    }, 200);
  }

  private playExplosionSound(): void {
    if (this.explosionSound) {
      this.explosionSound.currentTime = 0; // Reset to beginning
      this.explosionSound.play().catch(error => {
        console.error('Error playing explosion sound:', error);
      });
    }
  }

  private playAlarmSound(): void {
    if (this.alarmSound) {
      this.alarmSound.currentTime = 0; // Reset to beginning
      this.alarmSound.play().catch(error => {
        console.error('Error playing alarm sound:', error);
      });
    }
  }

  /**
   * Triggers the alarm animation
   */
  triggerAlarm(): void {
    this.alarmActive = true;
    this.playAlarmSound();
    
    // Reset animation after it completes (alarm runs for 5 seconds)
    setTimeout(() => {
      this.alarmActive = false;
    }, 5000);
  }

  /**
   * Triggers the countdown timer
   */
  triggerCountdown(): void {
    if (this.countdownTimer) {
      this.countdownTimer.startCountdown();
    }
  }

  /**
   * Triggers the shareholder value decrease
   */
  triggerShareholderValue(): void {
    if (this.shareholderValue) {
      this.shareholderValue.startValueDecrease();
    }
  }

  /**
   * Generic animation handler
   * @param animationName - Name of the animation to trigger
   */
  triggerAnimation(animationName: string): void {
    switch (animationName) {
      case 'lightning':
        this.triggerLightning();
        break;
      case 'alarm':
        this.triggerAlarm();
        break;
      case 'countdown':
        this.triggerCountdown();
        break;
      case 'shareholder':
        this.triggerShareholderValue();
        break;
      default:
        console.warn(`Animation '${animationName}' not found`);
    }
  }
}
