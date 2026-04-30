import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://127.0.0.1:5001/bookings';

  constructor(private http: HttpClient) {}

  bookClass(classId: string, token: string): Observable<any> {
    return this.http.post(
      this.apiUrl,
      { class_id: classId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  getMyBookings(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  cancelBooking(bookingId: string, token: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${bookingId}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
}