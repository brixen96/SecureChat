import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://' + environment.apiurl;
  private tokenKey = 'auth_token';
  private userRoleKey = 'user_role';
  private usernameKey = 'username';
  private temporaryPassword: string | null = null;

  constructor(private http: HttpClient) { }

  login(user: User): Observable<any> {
    const formData = new FormData();
    formData.append('username', user.username);
    formData.append('password', user.password || '');
    return this.http.post<any>(`${this.apiUrl}auth/token`, formData).pipe(
      tap(response => {
        if (response && response.access_token && response.user) {
          this.saveToken(response.access_token);
          this.saveUserRole(response.user.role);
          this.saveUsername(response.user.username);
        }
      })
    );
  }

  setTemporaryPassword(password: string): void {
    this.temporaryPassword = password;
  }

  getTemporaryPassword(): string | null {
    const password = this.temporaryPassword;
    this.temporaryPassword = null; // Clear it after getting it
    return password;
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}user/password`, { old_password: oldPassword, new_password: newPassword });
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  saveUserRole(role: string): void {
    localStorage.setItem(this.userRoleKey, role);
  }

  getRole(): string | null {
    return localStorage.getItem(this.userRoleKey);
  }

  saveUsername(username: string): void {
    localStorage.setItem(this.usernameKey, username);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userRoleKey);
    localStorage.removeItem(this.usernameKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }
}