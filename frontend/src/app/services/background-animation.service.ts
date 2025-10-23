import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackgroundAnimationService {
  private animationTriggerSubject = new Subject<string>();

  // Observable that other components can subscribe to
  public animationTrigger$ = this.animationTriggerSubject.asObservable();

  /**
   * Triggers a background animation
   * @param animationName - Name of the animation to trigger
   */
  triggerAnimation(animationName: string): void {
    this.animationTriggerSubject.next(animationName);
  }

  /**
   * Convenience method to trigger lightning animation
   */
  triggerLightning(): void {
    this.triggerAnimation('lightning');
  }

  /**
   * Convenience method to trigger alarm animation
   */
  triggerAlarm(): void {
    this.triggerAnimation('alarm');
  }

  /**
   * Convenience method to trigger countdown timer
   */
  triggerCountdown(): void {
    this.triggerAnimation('countdown');
  }

  /**
   * Convenience method to trigger shareholder value decrease
   */
  triggerShareholderValue(): void {
    this.triggerAnimation('shareholder');
  }

  /**
   * Convenience method to trigger brain rot video
   */
  triggerBrainRot(): void {
    this.triggerAnimation('brainrot');
  }
}
