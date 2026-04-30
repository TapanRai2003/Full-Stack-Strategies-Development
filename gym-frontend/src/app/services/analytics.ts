import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'http://127.0.0.1:5001/analytics';

  constructor(private http: HttpClient) {}

  getSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary`);
  }

  getPopularClasses(): Observable<any> {
    const token = localStorage.getItem('token');

    return this.http.get(`${this.apiUrl}/popular-classes`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}