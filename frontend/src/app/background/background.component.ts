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

  constructor(private backgroundAnimationService: BackgroundAnimationService) {}

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

  /**
   * Triggers the lightning animation
   */
  triggerLightning(): void {
    this.lightningActive = true;
    
    // Reset animation after it completes
    setTimeout(() => {
      this.lightningActive = false;
    }, 200);
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
