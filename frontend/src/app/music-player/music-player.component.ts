import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicPlayerService } from '../services/music-player.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-music-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="speaker-icon" (click)="toggleMute()" [class.muted]="isMuted">
      <i class="fas" [ngClass]="isMuted ? 'fa-volume-mute' : 'fa-volume-up'"></i>
    </div>
  `,
  styles: [`
    .speaker-icon {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      background: rgba(0, 0, 0, 0.8);
      border: 2px solid #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #ffffff;
      font-size: 20px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      z-index: 1000;
    }

    .speaker-icon:hover {
      background: rgba(255, 0, 0, 0.8);
      border-color: #ff0000;
      transform: scale(1.1);
    }

    .speaker-icon.muted {
      background: rgba(255, 0, 0, 0.6);
      border-color: #ff0000;
    }

    .speaker-icon.muted:hover {
      background: rgba(255, 0, 0, 0.9);
    }

    @media (max-width: 768px) {
      .speaker-icon {
        bottom: 15px;
        right: 15px;
        width: 45px;
        height: 45px;
        font-size: 18px;
      }
    }
  `]
})
export class MusicPlayerComponent implements OnInit, OnDestroy {
  isMuted = false;
  private subscriptions: Subscription[] = [];

  constructor(private musicPlayerService: MusicPlayerService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.musicPlayerService.isMuted$.subscribe(muted => {
        this.isMuted = muted;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleMute(): void {
    this.musicPlayerService.toggleMute();
  }
}
