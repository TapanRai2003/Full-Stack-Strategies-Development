import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  name = '';
  email = '';
  password = '';
  message = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register(): void {
    const data = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    this.authService.register(data).subscribe({
      next: () => {
        this.message = 'Registration successful. Please login.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },
      error: (err: any) => {
        this.message = err?.error?.message || 'Registration failed';
      }
    });
  }
}