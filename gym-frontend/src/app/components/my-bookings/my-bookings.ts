import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.css'
})
export class MyBookings implements OnInit {
  bookings: any[] = [];
  activeBookings: any[] = [];
  cancelledBookings: any[] = [];
  message = '';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

ngOnInit(): void {
  if (this.authService.isAdmin()) {
    this.message = 'Admins cannot access member bookings.';
    return;
  }

  this.loadBookings();
}

  loadBookings(): void {
    const token = this.authService.getToken();

    if (!token) {
      this.message = 'Please login first';
      this.bookings = [];
      this.activeBookings = [];
      this.cancelledBookings = [];
      this.cdr.detectChanges();
      return;
    }

    this.bookingService.getMyBookings(token).subscribe({
      next: (res: any) => {
        this.bookings = Array.isArray(res)
          ? res.map((booking: any) => ({
              ...booking,
              image: this.getImageByType(booking.class_type)
            }))
          : [];

        this.activeBookings = this.bookings.filter(
          (booking: any) => booking.status === 'booked'
        );

        this.cancelledBookings = this.bookings.filter(
          (booking: any) => booking.status === 'cancelled'
        );

        this.message = this.bookings.length ? '' : 'No bookings found';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.bookings = [];
        this.activeBookings = [];
        this.cancelledBookings = [];

        this.message = err?.status === 401
          ? 'Session expired. Please login again.'
          : (err?.error?.message || 'Failed to load bookings');

        this.cdr.detectChanges();
      }
    });
  }

  cancelBooking(bookingId: string): void {
    const token = this.authService.getToken();

    if (!token) {
      alert('Please login first.');
      this.message = 'Please login first';
      this.cdr.detectChanges();
      return;
    }

    const confirmed = window.confirm('Are you sure you want to cancel this booking?');

    if (!confirmed) {
      return;
    }

    this.bookingService.cancelBooking(bookingId, token).subscribe({
      next: (res: any) => {
        this.message = res.message || 'Booking cancelled successfully';
        alert(this.message);
        this.loadBookings();
      },
      error: (err: any) => {
        console.log('CANCEL BOOKING ERROR:', err);
        this.message = err?.error?.message || 'Failed to cancel booking';
        alert(this.message);
        this.cdr.detectChanges();
      }
    });
  }

  getImageByType(type: string): string {
    const bookingType = (type || '').toLowerCase();

    if (bookingType.includes('yoga') || bookingType.includes('pilates')) {
      return '/images/yoga.png';
    }

    if (bookingType.includes('hiit')) {
      return '/images/hiit.png';
    }

    if (
      bookingType.includes('cardio') ||
      bookingType.includes('cycling') ||
      bookingType.includes('spin')
    ) {
      return '/images/cycling.png';
    }

    if (
      bookingType.includes('strength') ||
      bookingType.includes('weights')
    ) {
      return '/images/weights.png';
    }

    return '/images/hero-gym.png';
  }
}