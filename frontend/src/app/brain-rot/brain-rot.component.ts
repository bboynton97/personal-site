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
  private videoElement: HTMLVideoElement | null = null;

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    this.stopVideo();
  }

  /**
   * Starts the brain rot video
   */
  startBrainRot(): void {
    this.isActive = true;
    
    // Wait for the DOM to update before accessing the video element
    setTimeout(() => {
      this.playVideo();
    }, 100);
  }

  /**
   * Stops the brain rot video and closes the overlay
   */
  stopBrainRot(): void {
    this.isActive = false;
    this.stopVideo();
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
