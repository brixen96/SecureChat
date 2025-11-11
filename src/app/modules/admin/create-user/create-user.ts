import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './create-user.html',
  styleUrl: './create-user.scss'
})
export class CreateUserComponent {
  createUserForm: FormGroup;
  newUser: { username: string, password: string } | null = null;
  createUserError: string | null = null;
  faArrowLeft = faArrowLeft;

  constructor(
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.createUserForm = this.fb.group({
      username: ['', Validators.required]
    });
  }

  onCreateUser(): void {
    if (this.createUserForm.valid) {
      const username = this.createUserForm.value.username;
      this.userService.createUser(username).subscribe({
        next: (response) => {
          this.newUser = response;
          this.createUserError = null;
          this.createUserForm.reset();
        },
        error: (error) => {
          this.createUserError = error.error.detail || 'Failed to create user';
          this.newUser = null;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }
}
