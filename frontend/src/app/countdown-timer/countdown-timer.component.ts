import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown-timer.component.html',
  styleUrl: './countdown-timer.component.css'
})
export class CountdownTimerComponent implements OnInit, OnDestroy {
  isActive = false;
  timeRemaining = 120; // 2 minutes in seconds
  displayTime = '02:00';
  private intervalId: any;

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }

  startCountdown(): void {
    if (this.isActive) {
      return; // Already running
    }

    this.isActive = true;
    this.timeRemaining = 120; // Reset to 2 minutes
    this.updateDisplayTime();

    this.intervalId = setInterval(() => {
      this.timeRemaining--;
      this.updateDisplayTime();

      if (this.timeRemaining <= 0) {
        this.stopCountdown();
      }
    }, 1000);
  }

  stopCountdown(): void {
    this.isActive = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  resetCountdown(): void {
    this.stopCountdown();
    this.timeRemaining = 120;
    this.updateDisplayTime();
  }

  private updateDisplayTime(): void {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    this.displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
