import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private apiUrl = 'http://127.0.0.1:5001/classes';

  constructor(private http: HttpClient) {}

  getClasses(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getClassById(classId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${classId}`);
  }

  createClass(gymClass: any): Observable<any> {
    return this.http.post(this.apiUrl, gymClass);
  }

  addClass(gymClass: any): Observable<any> {
    return this.createClass(gymClass);
  }

  updateClass(classId: string, gymClass: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${classId}`, gymClass);
  }

  deleteClass(classId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${classId}`);
  }
}