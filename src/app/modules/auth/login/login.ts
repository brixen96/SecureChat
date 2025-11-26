import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FontAwesomeModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  faUser = faUser;
  faLock = faLock;
  loginForm: FormGroup;
  loginError: string | null = null;
  protected isLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.loginError = null;
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login successful', response);
          if (response.password_change_required) {
            this.authService.setTemporaryPassword(this.loginForm.value.password);
            this.router.navigate(['/force-password-change']);
          } else {
            const role = this.authService.getRole();
            if (role === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/chat']);
            }
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Login failed', error);
          this.loginError = error.error.detail || 'An unknown error occurred.';
          this.isLoading.set(false);
        }
      });
    }
  }
}
