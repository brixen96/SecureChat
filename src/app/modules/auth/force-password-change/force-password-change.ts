import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-force-password-change',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './force-password-change.html',
  styleUrl: './force-password-change.scss'
})
export class ForcePasswordChange implements OnInit {
  changePasswordForm: FormGroup;
  changePasswordError: string | null = null;
  oldPassword: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.changePasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.oldPassword = this.authService.getTemporaryPassword();
    if (!this.oldPassword) {
      // If there is no temporary password, redirect to login
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit(): void {
    this.changePasswordError = null;
    if (this.changePasswordForm.valid && this.oldPassword) {
      const { newPassword } = this.changePasswordForm.value;
      this.authService.changePassword(this.oldPassword, newPassword).subscribe({
        next: () => {
          console.log('Password changed successfully');
          // Re-login with the new password to get a new token
          const username = this.authService.getUsername();
          if (username) {
            this.authService.login({ username, password: newPassword }).subscribe({
              next: () => {
                const role = this.authService.getRole();
                if (role === 'admin') {
                  this.router.navigate(['/admin']);
                } else {
                  this.router.navigate(['/chat']);
                }
              },
              error: (error) => {
                console.error('Login after password change failed', error);
                this.changePasswordError = 'Login failed after password change. Please login again.';
              }
            });
          } else {
            // if for some reason username is not available, redirect to login
            this.router.navigate(['/login']);
          }
        },
        error: (error) => {
          console.error('Password change failed', error);
          this.changePasswordError = error.error.detail || 'An unknown error occurred.';
        }
      });
    }
  }
}
