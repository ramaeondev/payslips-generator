import { Component, signal, computed, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PayslipService } from '../services/payslip.service';
import { PayslipPreviewComponent } from './payslip-preview.component';
import { AuthService } from '../services/auth.service';
import { ClientService, Client } from '../services/client.service';
import { OrganizationService } from '../services/organization.service';

@Component({
  selector: 'app-payslip-editor',
  imports: [FormsModule, PayslipPreviewComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header with User Menu -->
      <header class="bg-white shadow-sm border-b sticky top-0 z-20">
        <div class="max-w-full mx-auto px-4 py-3">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900">Payslip Generator</h1>
                <p class="text-xs text-gray-600">Dashboard</p>
              </div>
            </div>
            
            <div class="flex items-center gap-4">
              <div class="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm text-gray-700">{{ user()?.email }}</span>
              </div>
              <a
                routerLink="/settings"
                class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Settings
              </a>
              <button
                (click)="logout()"
                class="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <div class="max-w-full mx-auto p-4">
        <div class="mb-4 text-gray-600 text-sm">
          Enter JSON data on the left to preview payslips on the right
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-180px)]">
          <!-- Left Panel - JSON Editor -->
          <div class="bg-white rounded-lg shadow-lg flex flex-col">
            <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h2 class="text-xl font-semibold text-gray-800">JSON Input</h2>
              <div class="flex gap-2 items-center">
                <select [(ngModel)]="selectedClientId" (change)="onClientChange()" class="p-2 border rounded text-sm">
                  <option value="">No client</option>
                  <option *ngFor="let c of clients()" [value]="c.id">{{ c.name }}</option>
                </select>
                <button
                  (click)="loadSampleData()"
                  class="px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                >
                  Load Sample
                </button>
                <button
                  (click)="clearData()"
                  class="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Clear
                </button>
                <button
                  (click)="formatJson()"
                  class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Format
                </button>
              </div>
            </div>
            
            <div class="flex-1 p-4 overflow-hidden">
              <textarea
                [value]="jsonInput()"
                (input)="onJsonInput($event)"
                class="w-full h-full p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                [class.border-red-500]="error()"
                placeholder="Paste or type your JSON data here..."
                spellcheck="false"
              ></textarea>
            </div>

            <!-- Error Display -->
            @if (error()) {
              <div class="p-4 bg-red-50 border-t border-red-200">
                <div class="flex items-start">
                  <svg class="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Validation Error</h3>
                    <p class="text-sm text-red-700 mt-1">{{ error() }}</p>
                  </div>
                </div>
              </div>
            }

            <!-- JSON Guide -->
            <div class="p-4 bg-blue-50 border-t">
              <details class="cursor-pointer">
                <summary class="font-semibold text-blue-900 hover:text-blue-700">
                  📖 JSON Structure Guide
                </summary>
                <div class="mt-3 text-sm text-gray-700 space-y-2">
                  <p><strong>Required fields:</strong></p>
                  <ul class="list-disc list-inside ml-2 space-y-1">
                    <li><code class="bg-white px-1 rounded">organization</code> - Company details (name, address, contact)</li>
                    <li><code class="bg-white px-1 rounded">payslips</code> - Array of payslip objects</li>
                    <li><code class="bg-white px-1 rounded">employee</code> - Employee info (id, name, designation)</li>
                    <li><code class="bg-white px-1 rounded">salaryComponents</code> - Array with type: 'earning' or 'deduction'</li>
                  </ul>
                  <p class="mt-2">
                    <a 
                      href="/sample-payslip.json" 
                      target="_blank"
                      class="text-blue-600 hover:underline"
                    >
                      View sample JSON file →
                    </a>
                  </p>
                </div>
              </details>
            </div>
          </div>

          <!-- Right Panel - Preview -->
          <div class="bg-white rounded-lg shadow-lg overflow-auto">
            <div class="p-4 border-b bg-gray-50 sticky top-0 z-10">
              <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-800">Payslip Preview</h2>
                @if (payslipData()?.payslips && payslipData()!.payslips.length > 1) {
                  <div class="flex items-center gap-2">
                    <label class="text-sm font-medium text-gray-700">Payslip:</label>
                    <select
                      [value]="selectedPayslipIndex()"
                      (change)="onPayslipSelect($event)"
                      class="px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      @for (payslip of payslipData()!.payslips; track payslip.payslipNumber; let i = $index) {
                        <option [value]="i">
                          {{ payslip.employee.name }} - {{ payslip.month }} {{ payslip.year }}
                        </option>
                      }
                    </select>
                  </div>
                }
              </div>
            </div>
            
            <div class="p-4">
              @if (currentPayslip()) {
                <app-payslip-preview
                  [payslipData]="currentPayslip()"
                  [organization]="payslipData()!.organization"
                  [client]="resolvedClient()"
                  [elementId]="'payslip-' + selectedPayslipIndex()"
                />
              } @else {
                <div class="flex flex-col items-center justify-center h-96 text-gray-400">
                  <svg class="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <p class="text-lg font-medium">No payslip to preview</p>
                  <p class="text-sm mt-2">Enter valid JSON data to see the preview</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PayslipEditorComponent implements OnInit {
  private readonly payslipService = new PayslipService();
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly orgService = inject(OrganizationService);
  private readonly clientService = inject(ClientService);
  
  readonly jsonInput = signal<string>('');
  readonly payslipData = computed(() => this.payslipService.data());
  readonly error = computed(() => this.payslipService.error());
  readonly selectedPayslipIndex = signal<number>(0);
  readonly user = this.authService.user;
  readonly currentOrg = computed(() => this.orgService.organization());

  readonly clients = signal<Client[]>([]);
  readonly selectedClientId = signal<string | null>(null);

  readonly currentPayslip = computed(() => {
    const data = this.payslipData();
    const index = this.selectedPayslipIndex();
    return data?.payslips?.[index] || null;
  });

  // Resolve client in the following order: per-payslip client, top-level client, selected client
  readonly resolvedClient = computed(() => {
    const payslipClient = this.currentPayslip()?.client;
    if (payslipClient) return payslipClient;

    const topClient = this.payslipData()?.client;
    if (topClient) return topClient;

    const selId = this.selectedClientId();
    if (selId) return this.clients().find((c) => c.id === selId) ?? null;

    return null;
  });

  async ngOnInit(): Promise<void> {
    const org = this.currentOrg();
    if (org) {
      const list = await this.clientService.getClients(org.id);
      this.clients.set(list);
    }
  }

  onJsonInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const value = textarea.value;
    this.jsonInput.set(value);
    
    if (value.trim()) {
      this.payslipService.validateAndSetPayslipData(value);
      this.selectedPayslipIndex.set(0);
    }
  }

  onPayslipSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedPayslipIndex.set(Number.parseInt(select.value, 10));
  }

  async onClientChange(): Promise<void> {
    const id = this.selectedClientId();
    if (!id) return;
    // prefetch client into memory
    await this.clientService.getClientWithAssets(id);
  }

  async loadSampleData(): Promise<void> {
    try {
      const response = await fetch('/sample-payslip.json');
      const data = await response.json();

      // If organization settings are available, inject them into the sample
      const org = this.currentOrg();
      if (org) {
        data.organization = data.organization || {};
        data.organization.name = org.name || data.organization.name;
        data.organization.address = org.address || data.organization.address;
        data.organization.city = org.city || data.organization.city;
        data.organization.state = org.state || data.organization.state;
        data.organization.zipCode = org.postal_code || data.organization.zipCode;
        data.organization.country = org.country || data.organization.country;
        data.organization.phone = org.phone || data.organization.phone;
        data.organization.email = org.email || data.organization.email;
        data.organization.website = org.website || data.organization.website;
        // Prefer the stored public logo URL when available
        data.organization.logo = org.logo_url || data.organization.logo;
      }

      // If a client is selected, inject client info
      const clientId = this.selectedClientId();
      if (clientId) {
        const client = await this.clientService.getClientWithAssets(clientId);
        if (client) {
          data.client = data.client || {};
          data.client.name = client.name || data.client.name;
          data.client.contact_name = client.contact_name || data.client.contact_name;
          data.client.contact_email = client.contact_email || data.client.contact_email;
          data.client.contact_phone = client.contact_phone || data.client.contact_phone;
          data.client.address = client.address || data.client.address;
          data.client.city = client.city || data.client.city;
          data.client.state = client.state || data.client.state;
          data.client.zipCode = client.postal_code || data.client.zipCode;
          data.client.country = client.country || data.client.country;
          data.client.logo = client.logo || data.client.logo;
          data.client.header = client.header || data.client.header;
          data.client.footer = client.footer || data.client.footer;
          data.client.signature = client.signature || data.client.signature;
        }
      }

      const formatted = JSON.stringify(data, null, 2);
      this.jsonInput.set(formatted);
      this.payslipService.validateAndSetPayslipData(formatted);
      this.selectedPayslipIndex.set(0);
    } catch (error) {
      console.error('Error loading sample data:', error);
    }
  }

  clearData(): void {
    this.jsonInput.set('');
    this.payslipService.validateAndSetPayslipData('');
    this.selectedPayslipIndex.set(0);
  }

  formatJson(): void {
    const current = this.jsonInput();
    if (current.trim()) {
      try {
        const parsed = JSON.parse(current);
        const formatted = JSON.stringify(parsed, null, 2);
        this.jsonInput.set(formatted);
      } catch (error) {
        console.error('Invalid JSON, cannot format:', error);
      }
    }
  }

  async logout(): Promise<void> {
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}
