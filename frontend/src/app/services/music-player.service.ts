import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MusicPlayerService {
  private audio: HTMLAudioElement | null = null;
  private explosionSound: HTMLAudioElement | null = null;
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private currentTimeSubject = new BehaviorSubject<number>(0);
  private durationSubject = new BehaviorSubject<number>(0);
  private volumeSubject = new BehaviorSubject<number>(0.5);
  private isMutedSubject = new BehaviorSubject<boolean>(false);

  public isPlaying$ = this.isPlayingSubject.asObservable();
  public currentTime$ = this.currentTimeSubject.asObservable();
  public duration$ = this.durationSubject.asObservable();
  public volume$ = this.volumeSubject.asObservable();
  public isMuted$ = this.isMutedSubject.asObservable();

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio(): void {
    this.audio = new Audio();
    this.audio.src = 'assets/music/Gesaffelstein Opr.mp3';
    this.audio.loop = true;
    this.audio.volume = 0.5;

    // Initialize explosion sound effect
    this.explosionSound = new Audio();
    this.explosionSound.src = 'assets/sfx/Explosion Sound Effect.mp3';
    this.explosionSound.volume = 0.7;

    // Set up event listeners
    this.audio.addEventListener('loadedmetadata', () => {
      this.durationSubject.next(this.audio?.duration || 0);
    });

    this.audio.addEventListener('timeupdate', () => {
      this.currentTimeSubject.next(this.audio?.currentTime || 0);
    });

    this.audio.addEventListener('play', () => {
      this.isPlayingSubject.next(true);
    });

    this.audio.addEventListener('pause', () => {
      this.isPlayingSubject.next(false);
    });

    this.audio.addEventListener('ended', () => {
      this.isPlayingSubject.next(false);
    });
  }

  play(): void {
    if (this.audio) {
      this.audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  }

  playExplosionSound(): void {
    if (this.explosionSound) {
      this.explosionSound.currentTime = 0; // Reset to beginning
      this.explosionSound.play().catch(error => {
        console.error('Error playing explosion sound:', error);
      });
    }
  }

  pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }

  togglePlayPause(): void {
    if (this.audio) {
      if (this.audio.paused) {
        this.play();
      } else {
        this.pause();
      }
    }
  }

  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
      this.volumeSubject.next(this.audio.volume);
    }
  }

  toggleMute(): void {
    if (this.audio) {
      this.audio.muted = !this.audio.muted;
      this.isMutedSubject.next(this.audio.muted);
    }
  }

  getIsMuted(): boolean {
    return this.audio?.muted || false;
  }

  setCurrentTime(time: number): void {
    if (this.audio) {
      this.audio.currentTime = time;
    }
  }

  getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  getDuration(): number {
    return this.audio?.duration || 0;
  }

  getIsPlaying(): boolean {
    return !this.audio?.paused || false;
  }

  getVolume(): number {
    return this.audio?.volume || 0.5;
  }
}
