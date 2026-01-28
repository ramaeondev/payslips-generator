import { Component, signal, OnInit, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClientService, Client, ClientAsset } from '../services/client.service';
import { AuthService } from '../services/auth.service';
import { OrganizationService } from '../services/organization.service';
import { ClientCardComponent } from './client-card.component';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ClientCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './clients.component.html', 
})
export class ClientsComponent implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly orgService = inject(OrganizationService);
  private readonly authService = inject(AuthService);

  readonly clients = signal<Client[]>([]);
  selectedOrgId: string | null = null;

  // current organization (single-org flow)
  readonly currentOrg = computed(() => this.orgService.organization());

  newName = '';
  newEmail = '';
  openNew = false;

  // new client attachments
  newLogoFile: File | null = null;
  newHeaderFile: File | null = null;
  newFooterFile: File | null = null;
  newSignatureFile: File | null = null;

  // additional new client fields
  newAddress = '';
  newCity = '';
  newState = '';
  newPostalCode = '';
  newWebsite = '';

  // Two-step flow state
  newStep: 1 | 2 = 1;
  creatingClient = false;
  createdClient: Client | null = null;
  createdClientAssets: ClientAsset[] = [];

  // Step1 errors
  newError: string | null = null;

  selectedClient: Client | null = null;
  assets: ClientAsset[] = [];
  uploadType: 'logo' | 'header' | 'footer' | 'signature' = 'logo';

  // uploading flags for edit asset uploads
  uploading: Record<string, boolean> = { logo: false, header: false, footer: false, signature: false };

  // metadata editor helpers
  metaPairs: Record<string, { key: string; value: string }> = {};
  newMetaKey = '';
  newMetaValue = '';

  // pending confirmations
  pendingDeleteClientId: string | null = null;
  pendingDeleteAssetId: string | null = null;
  pendingCancelCreate: boolean = false;
  selectedClientError: string | null = null;


  async ngOnInit(): Promise<void> {
    const user = this.authService.user();
    if (!user) return;

    const org = this.orgService.organization();
    if (org) {
      this.selectedOrgId = org.id;
    } else {
      // Fallback for older setups: pick first organization
      const orgs = await this.orgService.getUserOrganizations(user.id);
      if (orgs.length > 0) this.selectedOrgId = orgs[0].id;
    }

    if (this.selectedOrgId) await this.loadClients();
  }

  async loadClients(): Promise<void> {
    if (!this.selectedOrgId) return;
    const list = await this.clientService.getClients(this.selectedOrgId);
    this.clients.set(list);
  }

  // Step 1: create client record and move to step 2
  async createClientStep1(): Promise<void> {
    if (!this.selectedOrgId || !this.newName.trim()) return;
    this.creatingClient = true;
    this.newError = null;

    const payload: Partial<Client> = {
      name: this.newName.trim(),
      contact_email: this.newEmail || undefined,
      address: this.newAddress || undefined,
      city: this.newCity || undefined,
      state: this.newState || undefined,
      postal_code: this.newPostalCode || undefined,
      website: this.newWebsite || undefined
    };

    console.info('Creating client (step1) with payload:', payload);

    // Timeout wrapper to detect hangs
    const createPromise = this.clientService.createClient(this.selectedOrgId, payload);
    const timeoutMs = 15000;
    let timeoutId: any;

    try {
      const res = await Promise.race([
        createPromise,
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('timeout')), timeoutMs);
        })
      ]);

      // clear timeout if resolved
      if (timeoutId) clearTimeout(timeoutId);

      console.info('Create client response:', res);

      if (res && (res as any).success && (res as any).client) {
        this.createdClient = (res as any).client;
        this.newStep = 2;
        await this.loadCreatedClientAssets();
      } else {
        const msg = (res as any)?.error || 'Failed to create client';
        console.error('Create client failed:', msg, res);
        this.newError = typeof msg === 'string' ? msg : JSON.stringify(msg);
      }
    } catch (err: any) {
      if (err && err.message === 'timeout') {
        console.error('Create client request timed out');
        this.newError = `Request timed out after ${timeoutMs / 1000}s`;
      } else {
        console.error('Error creating client:', err);
        this.newError = err?.message || String(err);
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      this.creatingClient = false;
    }
  }

  // Upload selected files to the created client
  async uploadSelectedAttachments(): Promise<void> {
    if (!this.createdClient) return;
    const clientId = this.createdClient.id;
    const uploads: Array<Promise<any>> = [];
    if (this.newLogoFile) uploads.push(this.clientService.uploadClientAsset(clientId, 'logo', this.newLogoFile, this.newLogoFile.name));
    if (this.newHeaderFile) uploads.push(this.clientService.uploadClientAsset(clientId, 'header', this.newHeaderFile, this.newHeaderFile.name));
    if (this.newFooterFile) uploads.push(this.clientService.uploadClientAsset(clientId, 'footer', this.newFooterFile, this.newFooterFile.name));
    if (this.newSignatureFile) uploads.push(this.clientService.uploadClientAsset(clientId, 'signature', this.newSignatureFile, this.newSignatureFile.name));

    if (uploads.length > 0) {
      await Promise.all(uploads);
      await this.loadCreatedClientAssets();
      // clear selected files
      this.newLogoFile = null;
      this.newHeaderFile = null;
      this.newFooterFile = null;
      this.newSignatureFile = null;
    }
  }

  async finishCreateClient(): Promise<void> {
    // upload any selected files then close modal and refresh list
    await this.uploadSelectedAttachments();
    this.openNew = false;
    this.newStep = 1;
    this.createdClient = null;
    await this.loadClients();
  }

  promptCancelCreateFlow(): void {
    this.pendingCancelCreate = true;
  }

  async confirmCancelCreateFlow(): Promise<void> {
    if (this.createdClient) {
      await this.clientService.deleteClient(this.createdClient.id);
    }

    // reset
    this.pendingCancelCreate = false;
    this.openNew = false;
    this.newStep = 1;
    this.createdClient = null;
    this.newLogoFile = null;
    this.newHeaderFile = null;
    this.newFooterFile = null;
    this.newSignatureFile = null;
  }

  async loadCreatedClientAssets(): Promise<void> {
    if (!this.createdClient) return;
    this.createdClientAssets = await this.clientService.getClientAssets(this.createdClient.id);
  }

  // Small helpers to get the latest asset of a given type
  getCreatedAssetByType(type: 'logo' | 'header' | 'footer' | 'signature'): ClientAsset | undefined {
    return this.createdClientAssets.find(a => a.type === type);
  }

  getAssetByType(type: 'logo' | 'header' | 'footer' | 'signature'): ClientAsset | undefined {
    return this.assets.find(a => a.type === type);
  }

  async deleteCreatedAsset(asset: ClientAsset): Promise<void> {
    if (!this.createdClient) return;
    if (!confirm('Delete asset?')) return;
    await this.clientService.deleteClientAsset(asset.id);
    await this.loadCreatedClientAssets();
  }

  editClient(c: Client): void {
    // navigate to settings with client loaded or open modal (left minimal for now)
    this.selectedClient = c;
    this.loadClientAssets(c.id);
  }

  async selectClient(c: Client): Promise<void> {
    this.selectedClient = c;
    await this.loadClientAssets(c.id);

    // initialize metadata editor from client
    this.metaPairs = {};
    const meta = (c.metadata || {}) as Record<string, string>;
    Object.keys(meta).forEach(k => this.metaPairs[k] = { key: k, value: meta[k] });
    this.newMetaKey = '';
    this.newMetaValue = '';
  }

  promptDeleteClient(clientId: string): void {
    this.pendingDeleteClientId = clientId;
  }

  async confirmDeleteClient(): Promise<void> {
    const id = this.pendingDeleteClientId;
    if (!id) return;
    await this.clientService.deleteClient(id);
    this.pendingDeleteClientId = null;
    if (this.selectedOrgId) await this.loadClients();
  }

  async loadClientAssets(clientId: string): Promise<void> {
    this.assets = await this.clientService.getClientAssets(clientId);
  }

  async onAssetFile(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.selectedClient) return;
    const res = await this.clientService.uploadClientAsset(this.selectedClient.id, this.uploadType, file, file.name);
    if (res.success && res.asset) {
      this.assets.unshift(res.asset);
    }
    input.value = '';
  }

  // Upload a single asset for the selected client (used in edit inline)
  async onEditAssetFile(ev: Event, type: 'logo' | 'header' | 'footer' | 'signature'): Promise<void> {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.selectedClient) return;

    try {
      this.uploading[type] = true;
      const res = await this.clientService.uploadClientAsset(this.selectedClient.id, type, file, file.name);
      if (res.success && res.asset) {
        // refresh assets and selected client convenience fields
        await this.loadClientAssets(this.selectedClient.id);
        this.selectedClient = await this.clientService.getClientWithAssets(this.selectedClient.id) as any;
      }
    } finally {
      this.uploading[type] = false;
      input.value = '';
    }
  }

  // Delete the most recent asset of a given type for the selected client
  async deleteAssetByType(type: 'logo' | 'header' | 'footer' | 'signature'): Promise<void> {
    if (!this.selectedClient) return;
    const asset = this.assets.find(a => a.type === type);
    if (!asset) {
      alert('No asset of this type to delete');
      return;
    }

    if (!confirm('Delete asset?')) return;
    await this.clientService.deleteClientAsset(asset.id);
    await this.loadClientAssets(this.selectedClient.id);
    this.selectedClient = await this.clientService.getClientWithAssets(this.selectedClient.id) as any;
  }

  onNewClientFile(ev: Event, type: 'logo' | 'header' | 'footer' | 'signature'): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (type === 'logo') this.newLogoFile = file;
    if (type === 'header') this.newHeaderFile = file;
    if (type === 'footer') this.newFooterFile = file;
    if (type === 'signature') this.newSignatureFile = file;
  }

  metadataKeys(): string[] {
    return Object.keys(this.metaPairs);
  }

  addMeta(): void {
    if (!this.newMetaKey.trim()) return;
    this.metaPairs[this.newMetaKey.trim()] = { key: this.newMetaKey.trim(), value: this.newMetaValue };
    this.newMetaKey = '';
    this.newMetaValue = '';
  }

  removeMeta(key: string): void {
    delete this.metaPairs[key];
  }

  async saveClientChanges(): Promise<void> {
    if (!this.selectedClient) return;
    const updates: Partial<Client> = {
      name: this.selectedClient.name,
      contact_email: this.selectedClient.contact_email,
      contact_phone: this.selectedClient.contact_phone,
      address: this.selectedClient.address,
      city: this.selectedClient.city,
      state: this.selectedClient.state,
      postal_code: (this.selectedClient as any).zipCode || this.selectedClient.postal_code,
      country: this.selectedClient.country,
      logo: this.selectedClient.logo,
      header: this.selectedClient.header,
      footer: this.selectedClient.footer,
      signature: this.selectedClient.signature,
      metadata: Object.fromEntries(this.metadataKeys().map(k => [k, this.metaPairs[k].value])) as Record<string, string>
    };

    const res = await this.clientService.updateClient(this.selectedClient.id, updates);
    if (res.success && this.selectedOrgId) {
      await this.loadClients();
      this.selectedClient = await this.clientService.getClientWithAssets(this.selectedClient.id) as any;
    }
  }

  promptDeleteAsset(asset: ClientAsset): void {
    this.pendingDeleteAssetId = asset.id;
  }

  async confirmDeleteAsset(): Promise<void> {
    const id = this.pendingDeleteAssetId;
    if (!id) return;
    await this.clientService.deleteClientAsset(id);
    this.pendingDeleteAssetId = null;
    if (this.selectedClient) await this.loadClientAssets(this.selectedClient.id);
  }
}
