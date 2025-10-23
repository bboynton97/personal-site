import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shareholder-value',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shareholder-value.component.html',
  styleUrl: './shareholder-value.component.css'
})
export class ShareholderValueComponent implements OnInit, OnDestroy {
  isActive = false;
  currentValue = 0;
  displayValue = '$0';
  private intervalId: any;
  private startTime: number = 0;
  private accelerationDuration = 10000; // 10 seconds to reach max speed

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    this.stopValueDecrease();
  }

  startValueDecrease(): void {
    if (this.isActive) {
      return; // Already running
    }

    this.isActive = true;
    this.currentValue = 0;
    this.startTime = Date.now();
    this.updateDisplayValue();

    // Start decreasing value at random intervals
    this.scheduleNextDecrease();
  }

  stopValueDecrease(): void {
    this.isActive = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }

  resetValue(): void {
    this.stopValueDecrease();
    this.currentValue = 0;
    this.updateDisplayValue();
  }

  private scheduleNextDecrease(): void {
    if (!this.isActive) return;

    // Calculate acceleration factor (0 to 1 over accelerationDuration)
    const elapsed = Date.now() - this.startTime;
    const accelerationFactor = Math.min(elapsed / this.accelerationDuration, 1);
    
    // Start slow (1000ms) and accelerate to fast (5ms)
    const minInterval = 5;
    const maxInterval = 1000;
    const currentInterval = maxInterval - (maxInterval - minInterval) * accelerationFactor;
    
    // Random interval based on current speed
    const randomInterval = Math.random() * (currentInterval * 0.3) + (currentInterval * 0.7);
    
    // Start with small decreases (1-10) and accelerate to large decreases (100-500)
    const minDecrease = 1;
    const maxDecrease = 500;
    const currentDecreaseMin = minDecrease + (maxDecrease - minDecrease) * accelerationFactor * 0.2;
    const currentDecreaseMax = minDecrease + (maxDecrease - minDecrease) * accelerationFactor;
    
    this.intervalId = setTimeout(() => {
      if (this.isActive) {
        const decreaseAmount = Math.floor(Math.random() * (currentDecreaseMax - currentDecreaseMin + 1)) + currentDecreaseMin;
        this.currentValue -= decreaseAmount;
        this.updateDisplayValue();
        
        // Schedule next decrease
        this.scheduleNextDecrease();
      }
    }, randomInterval);
  }

  private updateDisplayValue(): void {
    this.displayValue = `$${this.currentValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }
}
