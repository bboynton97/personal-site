import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackgroundAnimationService } from '../services/background-animation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './background.component.html',
  styleUrl: './background.component.css'
})
export class BackgroundComponent implements OnInit, OnDestroy {
  lightningActive = false;
  private subscriptions: Subscription[] = [];
  private explosionSound: HTMLAudioElement | null = null;

  constructor(private backgroundAnimationService: BackgroundAnimationService) {
    this.initializeExplosionSound();
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

  /**
   * Generic animation handler
   * @param animationName - Name of the animation to trigger
   */
  triggerAnimation(animationName: string): void {
    switch (animationName) {
      case 'lightning':
        this.triggerLightning();
        break;
      default:
        console.warn(`Animation '${animationName}' not found`);
    }
  }
}
