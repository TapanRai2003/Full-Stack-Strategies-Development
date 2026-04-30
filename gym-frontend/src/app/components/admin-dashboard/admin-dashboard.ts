import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../services/analytics';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  summary: any = {};

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.analyticsService.getSummary().subscribe({
      next: (res: any) => {
        console.log('ADMIN SUMMARY RESPONSE:', res);
        this.summary = { ...res };
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log('DASHBOARD ERROR:', err);
      }
    });
  }
}