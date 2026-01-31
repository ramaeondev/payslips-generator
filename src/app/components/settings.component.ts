import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrganizationService, Organization } from '../services/organization.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
              <button
                (click)="goBack()"
                class="text-gray-600 hover:text-gray-900 transition"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
              </button>
              <h1 class="text-2xl font-bold text-gray-900">Organization Settings</h1>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-3">
              <button
                routerLink="/settings/clients"
                class="text-gray-600 hover:text-gray-900 transition text-sm font-medium"
              >
                Clients
              </button>
            </div>
              <button
                routerLink="/dashboard"
                class="text-gray-600 hover:text-gray-900 transition text-sm font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if (loading()) {
          <div class="flex justify-center items-center h-64">
            <svg class="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        } @else {
          <div class="space-y-6">
            <!-- Logo Section -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Organization Logo</h2>
              <div class="flex items-start gap-6">
                <div class="flex-shrink-0">
                  @if (currentOrg()?.logo_url) {
                    <img
                      [src]="currentOrg()!.logo_url"
                      alt="Organization logo"
                      class="w-32 h-32 object-contain rounded-lg border-2 border-gray-200"
                    />
                  } @else {
                    <div class="w-32 h-32 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                      <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                  }
                </div>
                <div class="flex-1">
                  <p class="text-sm text-gray-600 mb-3">
                    Upload your organization logo. This will appear on all generated payslips.
                  </p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    (change)="onLogoSelect($event)"
                    #fileInput
                    class="hidden"
                  />
                  <button
                    (click)="triggerFileInput(fileInput)"
                    [disabled]="uploadingLogo()"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    @if (uploadingLogo()) {
                      <span class="flex items-center gap-2">
                        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </span>
                    } @else {
                      <span>Upload Logo</span>
                    }
                  </button>
                  <p class="mt-2 text-xs text-gray-500">
                    PNG, JPG, or WebP. Max 5MB.
                  </p>
                </div>
              </div>
            </div>

            <!-- Organization Information Form -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Organization Information</h2>
              
              @if (successMessage()) {
                <div class="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div class="flex items-start">
                    <svg class="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <p class="text-sm text-green-700">{{ successMessage() }}</p>
                  </div>
                </div>
              }

              @if (errorMessage()) {
                <div class="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div class="flex items-start">
                    <svg class="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                    <p class="text-sm text-red-700">{{ errorMessage() }}</p>
                  </div>
                </div>
              }

              <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Organization Name -->
                  <div class="md:col-span-2">
                    <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                      Organization Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      formControlName="name"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <!-- Email -->
                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      formControlName="email"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <!-- Phone -->
                  <div>
                    <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      formControlName="phone"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <!-- Website -->
                  <div>
                    <label for="website" class="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      id="website"
                      type="url"
                      formControlName="website"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <!-- Tax ID -->
                  <div>
                    <label for="tax_id" class="block text-sm font-medium text-gray-700 mb-1">
                      Tax ID / GST Number
                    </label>
                    <input
                      id="tax_id"
                      type="text"
                      formControlName="tax_id"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <!-- Address -->
                  <div class="md:col-span-2">
                    <label for="address" class="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      id="address"
                      formControlName="address"
                      rows="2"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    ></textarea>
                  </div>

                  <!-- City -->
                  <div>
                    <label for="city" class="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      formControlName="city"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <!-- State -->
                  <div>
                    <label for="state" class="block text-sm font-medium text-gray-700 mb-1">
                      State / Province
                    </label>
                    <input
                      id="state"
                      type="text"
                      formControlName="state"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <!-- Postal Code -->
                  <div>
                    <label for="postal_code" class="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      id="postal_code"
                      type="text"
                      formControlName="postal_code"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <!-- Country -->
                  <div>
                    <label for="country" class="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      id="country"
                      type="text"
                      formControlName="country"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <!-- Save Button -->
                <div class="flex justify-end pt-4">
                  <button
                    type="submit"
                    [disabled]="settingsForm.invalid || saving()"
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    @if (saving()) {
                      <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    } @else {
                      <span>Save Changes</span>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      </main>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly orgService = inject(OrganizationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly uploadingLogo = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly currentOrg = computed(() => this.orgService.organization());

  readonly settingsForm: FormGroup;

  constructor() {
    this.settingsForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.email],
      phone: [''],
      website: [''],
      tax_id: [''],
      address: [''],
      city: [''],
      state: [''],
      postal_code: [''],
      country: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadOrganization();
  }

  async loadOrganization(): Promise<void> {
    this.loading.set(true);
    const user = this.authService.user();

    if (!user) {
      await this.router.navigate(['/login']);
      return;
    }

    try {
      const orgs = await this.orgService.getUserOrganizations(user.id);
      
      if (orgs.length > 0) {
        const org = orgs[0];
        this.settingsForm.patchValue({
          name: org.name || '',
          email: org.email || '',
          phone: org.phone || '',
          website: org.website || '',
          tax_id: org.tax_id || '',
          address: org.address || '',
          city: org.city || '',
          state: org.state || '',
          postal_code: org.postal_code || '',
          country: org.country || ''
        });
      }
    } catch (error) {
      console.error('Error loading organization:', error);
      this.errorMessage.set('Failed to load organization settings');
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.settingsForm.invalid) {
      return;
    }

    const org = this.currentOrg();
    const orgId = org?.id;
    if (!orgId) {
      this.errorMessage.set('No organization found');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const nameVal: string = String(this.settingsForm.get('name')?.value ?? '');
      const emailVal: string = String(this.settingsForm.get('email')?.value ?? '');
      const phoneVal: string = String(this.settingsForm.get('phone')?.value ?? '');
      const websiteVal: string = String(this.settingsForm.get('website')?.value ?? '');
      const taxIdVal: string = String(this.settingsForm.get('tax_id')?.value ?? '');
      const addressVal: string = String(this.settingsForm.get('address')?.value ?? '');
      const cityVal: string = String(this.settingsForm.get('city')?.value ?? '');
      const stateVal: string = String(this.settingsForm.get('state')?.value ?? '');
      const postalCodeVal: string = String(this.settingsForm.get('postal_code')?.value ?? '');
      const countryVal: string = String(this.settingsForm.get('country')?.value ?? '');

      const updates: Partial<Organization> = {
        name: nameVal,
        email: emailVal,
        phone: phoneVal,
        website: websiteVal,
        tax_id: taxIdVal,
        address: addressVal,
        city: cityVal,
        state: stateVal,
        postal_code: postalCodeVal,
        country: countryVal
      };

      // The form fields were explicitly coerced and typed above; pass securely to the service.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await this.orgService.updateOrganization(orgId, updates);
      
      if (result.success) {
        this.successMessage.set('Settings saved successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
      } else {
        this.errorMessage.set(result.error || 'Failed to save settings');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.errorMessage.set(message || 'An unexpected error occurred');
    } finally {
      this.saving.set(false);
    }
  }

  async onLogoSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set('File size must be less than 5MB');
      return;
    }

    const org = this.currentOrg();
    if (!org) {
      this.errorMessage.set('No organization found');
      return;
    }

    this.uploadingLogo.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const result = await this.orgService.uploadLogo(org.id, file);
      
      if (result.success) {
        this.successMessage.set('Logo uploaded successfully!');
        // Refresh current org
        await this.orgService.getOrganization(org.id);
        setTimeout(() => this.successMessage.set(''), 3000);
      } else {
        this.errorMessage.set(result.error || 'Failed to upload logo');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.errorMessage.set(message || 'An unexpected error occurred');
    } finally {
      this.uploadingLogo.set(false);
      input.value = ''; // Reset input
    }
  }

  triggerFileInput = (el: HTMLInputElement | null): void => {
    el?.click();
  }


  goBack(): void {
    window.history.back();
  }
}
