import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  userId = '';
  role = '';
  isLoggedIn = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const token = this.authService.getToken();

    if (!token) {
      this.isLoggedIn = false;
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      this.userId = payload.sub || 'N/A';
      this.role = payload.role || 'member';
      this.isLoggedIn = true;
    } catch (error) {
      console.log('PROFILE TOKEN ERROR:', error);
      this.isLoggedIn = false;
    }
  }
}