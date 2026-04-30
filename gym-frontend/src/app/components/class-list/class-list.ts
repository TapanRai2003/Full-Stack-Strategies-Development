import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClassService } from '../../services/class';
import { BookingService } from '../../services/booking';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-class-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './class-list.html',
  styleUrl: './class-list.css'
})
export class ClassList implements OnInit {
  classes: any[] = [];
  allClasses: any[] = [];

  searchText = '';
  selectedType = '';
  selectedInstructor = '';
  message = '';

  constructor(
    private classService: ClassService,
    private bookingService: BookingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.message = 'Loading classes...';

    this.classService.getClasses().subscribe({
      next: (res: any) => {
        console.log('CLASSES RESPONSE:', res);

        this.allClasses = Array.isArray(res)
          ? res.map((gymClass: any) => ({
              ...gymClass,
              image: this.getImageByType(gymClass.type)
            }))
          : [];

        this.classes = [...this.allClasses];
        this.message = this.classes.length ? '' : 'No classes found';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log('LOAD CLASSES ERROR:', err);

        this.classes = [];
        this.allClasses = [];
        this.message = 'Failed to load classes';
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    const search = this.searchText.toLowerCase().trim();

    this.classes = this.allClasses.filter((gymClass: any) => {
      const matchesSearch =
        !search ||
        gymClass.title?.toLowerCase().includes(search) ||
        gymClass.type?.toLowerCase().includes(search) ||
        gymClass.instructor?.toLowerCase().includes(search);

      const matchesType =
        !this.selectedType || gymClass.type === this.selectedType;

      const matchesInstructor =
        !this.selectedInstructor || gymClass.instructor === this.selectedInstructor;

      return matchesSearch && matchesType && matchesInstructor;
    });

    this.message = this.classes.length ? '' : 'No classes found';
    this.cdr.detectChanges();
  }

  resetFilters(): void {
    this.searchText = '';
    this.selectedType = '';
    this.selectedInstructor = '';

    this.classes = [...this.allClasses];
    this.message = '';
    this.cdr.detectChanges();
  }

  getUniqueTypes(): string[] {
    return [...new Set(this.allClasses.map((c: any) => c.type).filter(Boolean))];
  }

  getUniqueInstructors(): string[] {
    return [...new Set(this.allClasses.map((c: any) => c.instructor).filter(Boolean))];
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  bookClass(classId: string): void {
    const token = this.authService.getToken();

    if (!token) {
      alert('Please login first to book a class.');
      this.message = 'Please login first to book a class';
      this.cdr.detectChanges();
      return;
    }

    if (this.authService.isAdmin()) {
      alert('Admins cannot book classes. Please use a member account.');
      this.message = 'Admins cannot book classes';
      this.cdr.detectChanges();
      return;
    }

    const confirmed = window.confirm('Do you want to book this class?');

    if (!confirmed) {
      return;
    }

    this.bookingService.bookClass(classId, token).subscribe({
      next: (res: any) => {
        this.message = res.message || 'Class booked successfully';
        alert(this.message);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log('BOOKING ERROR FULL:', err);
        this.message = err?.error?.message || 'Booking failed';
        alert(this.message);
        this.cdr.detectChanges();
      }
    });
  }

  getImageByType(type: string): string {
    const classType = (type || '').toLowerCase();

    if (classType.includes('yoga') || classType.includes('pilates')) {
      return '/images/yoga.png';
    }

    if (classType.includes('hiit')) {
      return '/images/hiit.png';
    }

    if (
      classType.includes('cardio') ||
      classType.includes('cycling') ||
      classType.includes('spin')
    ) {
      return '/images/cycling.png';
    }

    if (
      classType.includes('strength') ||
      classType.includes('weights')
    ) {
      return '/images/weights.png';
    }

    return '/images/hero-gym.png';
  }
}