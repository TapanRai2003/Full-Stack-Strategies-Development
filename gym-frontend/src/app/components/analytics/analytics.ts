import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class Analytics implements OnInit {
  popularClasses: any[] = [];
  message = '';

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('ANALYTICS COMPONENT LOADED');
    this.loadPopularClasses();
  }

  loadPopularClasses(): void {
    this.analyticsService.getPopularClasses().subscribe({
      next: (res: any) => {
        console.log('POPULAR CLASSES RESPONSE:', res);
        this.popularClasses = Array.isArray(res) ? [...res] : [];
        this.message = this.popularClasses.length ? '' : 'No analytics data found';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log('POPULAR CLASSES ERROR:', err);
        this.popularClasses = [];
        this.message = err?.error?.error || 'Failed to load analytics';
        this.cdr.detectChanges();
      }
    });
  }

  getMaxBookings(): number {
    if (!this.popularClasses.length) return 1;
    return Math.max(...this.popularClasses.map(item => item.bookings_count || 0), 1);
  }

  getBarWidth(count: number): string {
    const max = this.getMaxBookings();
    return `${(count / max) * 100}%`;
  }
}