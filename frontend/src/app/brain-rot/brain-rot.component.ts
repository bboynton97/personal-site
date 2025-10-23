import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-brain-rot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brain-rot.component.html',
  styleUrl: './brain-rot.component.css'
})
export class BrainRotComponent implements OnInit, OnDestroy {
  isActive = false;
  fCounter = 0;
  jCounter = 0;
  fCounterShake = false;
  jCounterShake = false;
  private videoElement: HTMLVideoElement | null = null;
  private keydownListener: ((event: KeyboardEvent) => void) | null = null;

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    this.stopVideo();
    this.removeKeyListener();
  }

  /**
   * Starts the brain rot video
   */
  startBrainRot(): void {
    this.isActive = true;
    this.fCounter = 0;
    this.jCounter = 0;
    this.fCounterShake = false;
    this.jCounterShake = false;
    
    // Wait for the DOM to update before accessing the video element
    setTimeout(() => {
      this.playVideo();
      this.addKeyListener();
    }, 100);
  }

  /**
   * Stops the brain rot video and closes the overlay
   */
  stopBrainRot(): void {
    this.isActive = false;
    this.stopVideo();
    this.removeKeyListener();
  }

  private addKeyListener(): void {
    this.keydownListener = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'f') {
        event.preventDefault();
        event.stopPropagation();
        this.fCounter++;
        this.triggerFShake();
        this.checkWinCondition();
      } else if (event.key.toLowerCase() === 'j') {
        event.preventDefault();
        event.stopPropagation();
        this.jCounter++;
        this.triggerJShake();
        this.checkWinCondition();
      }
    };
    
    document.addEventListener('keydown', this.keydownListener, true);
  }

  private removeKeyListener(): void {
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener, true);
      this.keydownListener = null;
    }
  }

  private checkWinCondition(): void {
    if (this.fCounter >= 100 && this.jCounter >= 100) {
      this.stopBrainRot();
    }
  }

  private triggerFShake(): void {
    this.fCounterShake = true;
    setTimeout(() => {
      this.fCounterShake = false;
    }, 200);
  }

  private triggerJShake(): void {
    this.jCounterShake = true;
    setTimeout(() => {
      this.jCounterShake = false;
    }, 200);
  }

  private playVideo(): void {
    this.videoElement = document.getElementById('brain-rot-video') as HTMLVideoElement;
    
    if (this.videoElement) {
      this.videoElement.currentTime = 0; // Reset to beginning
      this.videoElement.loop = true; // Loop the video
      this.videoElement.volume = 0.8; // Set volume
      
      this.videoElement.play().catch(error => {
        console.error('Error playing brain rot video:', error);
      });
    }
  }

  private stopVideo(): void {
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.currentTime = 0;
    }
  }
}
