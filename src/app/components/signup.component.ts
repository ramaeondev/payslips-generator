import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Logo/Header -->
        <div class="text-center">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
          </div>
          <h2 class="text-3xl font-bold text-gray-900">Create your account</h2>
          <p class="mt-2 text-sm text-gray-600">Start generating professional payslips</p>
        </div>

        <!-- Signup Form -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Organization Name -->
            <div>
              <label for="orgName" class="block text-sm font-medium text-gray-700 mb-2">
                Organization Name <span class="text-red-500">*</span>
              </label>
              <input
                id="orgName"
                type="text"
                formControlName="orgName"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Acme Corporation"
              />
              @if (controlHasError('orgName')) {
                <p class="mt-1 text-sm text-red-600">
                  @if (controlHasError('orgName', 'required')) {
                    Organization name is required
                  }
                  @if (controlHasError('orgName', 'minlength')) {
                    Organization name must be at least 2 characters
                  }
                </p>
              }
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span class="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="you@example.com"
              />
              @if (controlHasError('email')) {
                <p class="mt-1 text-sm text-red-600">
                  @if (controlHasError('email', 'required')) {
                    Email is required
                  }
                  @if (controlHasError('email', 'email')) {
                    Please enter a valid email address
                  }
                </p>
              }
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Password <span class="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
              @if (controlHasError('password')) {
                <p class="mt-1 text-sm text-red-600">
                  @if (controlHasError('password', 'required')) {
                    Password is required
                  }
                  @if (controlHasError('password', 'minlength')) {
                    Password must be at least 8 characters
                  }
                  @if (controlHasError('password', 'pattern')) {
                    Password must contain uppercase, lowercase, number, and special character
                  }
                </p>
              }
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span class="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
              @if (controlHasError('confirmPassword')) {
                <p class="mt-1 text-sm text-red-600">
                  @if (controlHasError('confirmPassword', 'required')) {
                    Please confirm your password
                  }
                </p>
              }
              @if (signupForm.errors?.['passwordMismatch'] && this.signupForm.get('confirmPassword')?.touched) {
                <p class="mt-1 text-sm text-red-600">
                  Passwords do not match
                </p>
              }
            </div>

            <!-- Error Message -->
            @if (errorMessage()) {
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex items-start">
                  <svg class="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                  <p class="text-sm text-red-700">{{ errorMessage() }}</p>
                </div>
              </div>
            }

            <!-- Success Message -->
            @if (successMessage()) {
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex flex-col">
                  <div class="flex items-start mb-3">
                    <svg class="w-6 h-6 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    <div class="flex-1">
                      <h3 class="font-semibold text-blue-900 mb-1">Check Your Email</h3>
                      <p class="text-sm text-blue-700">{{ successMessage() }}</p>
                    </div>
                  </div>
                  <div class="bg-white rounded-lg p-3 border border-blue-100">
                    <p class="text-xs text-gray-600 mb-2">Next steps:</p>
                    <ol class="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                      <li>Check your email inbox</li>
                      <li>Click the confirmation link in the email</li>
                      <li>Return here and sign in</li>
                    </ol>
                  </div>
                  <div class="mt-3 text-center">
                    <a routerLink="/login" class="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Go to Login →
                    </a>
                  </div>
                </div>
              </div>
            }

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="signupForm.invalid || loading()"
              class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              @if (loading()) {
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              } @else {
                <span>Create Account</span>
              }
            </button>
          </form>

          <!-- Login Link -->
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              Already have an account?
              <a routerLink="/login" class="font-semibold text-blue-600 hover:text-blue-700 transition">
                Sign in
              </a>
            </p>
          </div>
        </div>

        <!-- Terms -->
        <p class="text-center text-xs text-gray-500">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  `
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly signupForm: FormGroup;

  constructor() {
    this.signupForm = this.fb.group({
      orgName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // helpers for template validity checks (bound)
  controlHasError = (name: string, errorKey?: string): boolean => {
    const ctrl = this.signupForm.get(name);
    if (!ctrl) return false;
    if (errorKey) {
      const errs = ctrl.errors as unknown as Record<string, unknown> | null;
      const exists = errs ? Object.prototype.hasOwnProperty.call(errs, errorKey) : false;
      return !!(exists && ctrl.touched);
    }
    return !!(ctrl.invalid && ctrl.touched);
  };

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password: string = String(form.get('password')?.value ?? '');
    const confirmPassword: string = String(form.get('confirmPassword')?.value ?? '');
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  async onSubmit(): Promise<void> {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { email, password, orgName } = this.signupForm.value as { email: string; password: string; orgName: string };

    try {
      const result = await this.authService.signUpWithOrg(email, password, orgName);
      
      if (result.error) {
        this.errorMessage.set(result.error);
      } else {
        this.successMessage.set('Account created successfully! Please check your email to verify your account before logging in.');
        this.signupForm.reset();
        
        // Don't auto-redirect - let user read the message
        // They need to confirm email first
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.errorMessage.set(message || 'An unexpected error occurred');
    } finally {
      this.loading.set(false);
    }
  }
}
