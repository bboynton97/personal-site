import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface EventsByType {
  type: string;
  count: number;
}

interface EventsByDay {
  date: string;
  count: number;
}

interface RecentEvent {
  id: number;
  event_type: string;
  event_data: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string | null;
}

interface AdminStats {
  total_events: number;
  events_by_type: EventsByType[];
  events_last_24h: number;
  events_last_7d: number;
  unique_ips: number;
  events_by_day: EventsByDay[];
  recent_events: RecentEvent[];
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit, OnDestroy {
  stats: AdminStats | null = null;
  loading = true;
  error: string | null = null;
  private refreshInterval: any;
  lastUpdated: Date | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStats();
    // Refresh every 30 seconds
    this.refreshInterval = setInterval(() => this.loadStats(), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadStats(): void {
    const apiUrl = environment.apiUrl || 'https://api.braelyn.ai';
    this.http.get<AdminStats>(`${apiUrl}/api/admin/stats`).subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        this.error = null;
        this.lastUpdated = new Date();
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
        this.error = 'Failed to load statistics';
        this.loading = false;
      }
    });
  }

  getMaxDayCount(): number {
    if (!this.stats?.events_by_day.length) return 1;
    return Math.max(...this.stats.events_by_day.map(d => d.count));
  }

  getBarHeight(count: number): number {
    const max = this.getMaxDayCount();
    return max > 0 ? (count / max) * 100 : 0;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  formatDateTime(dateStr: string | null): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEventTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'page_view': '#4ecdc4',
      'click': '#ff6b6b',
      'scroll': '#ffd93d',
      'interaction': '#95e1d3',
      'error': '#ff4757',
      'navigation': '#5f27cd',
    };
    return colors[type.toLowerCase()] || '#6c5ce7';
  }

  getEventTypeEmoji(type: string): string {
    const emojis: Record<string, string> = {
      'page_view': '👁️',
      'click': '👆',
      'scroll': '📜',
      'interaction': '🤝',
      'error': '⚠️',
      'navigation': '🧭',
      'terminal_start': '💻',
      'terminal_command': '⌨️',
    };
    return emojis[type.toLowerCase()] || '📊';
  }

  getTotalTypeCount(): number {
    if (!this.stats?.events_by_type.length) return 0;
    return this.stats.events_by_type.reduce((sum, t) => sum + t.count, 0);
  }

  getTypePercentage(count: number): number {
    const total = this.getTotalTypeCount();
    return total > 0 ? (count / total) * 100 : 0;
  }
}
