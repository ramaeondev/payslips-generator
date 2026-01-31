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
  readonly selectedOrgId = signal<string | null>(null);

  // current organization (single-org flow)
  readonly currentOrg = computed(() => this.orgService.organization());

  // New client form state (signals)
  readonly newName = signal<string>('');
  readonly newEmail = signal<string>('');
  readonly openNew = signal<boolean>(false);

  // new client attachments
  readonly newLogoFile = signal<File | null>(null);
  readonly newHeaderFile = signal<File | null>(null);
  readonly newFooterFile = signal<File | null>(null);
  readonly newSignatureFile = signal<File | null>(null);

  // additional new client fields
  readonly newAddress = signal<string>('');
  readonly newCity = signal<string>('');
  readonly newState = signal<string>('');
  readonly newPostalCode = signal<string>('');
  readonly newWebsite = signal<string>('');

  // Two-step flow state
  readonly newStep = signal<1 | 2>(1);
  readonly creatingClient = signal<boolean>(false);
  readonly createdClient = signal<Client | null>(null);
  readonly createdClientAssets = signal<ClientAsset[]>([]);

  // Step1 errors
  readonly newError = signal<string | null>(null);

  // Selected client editing state
  readonly selectedClient = signal<Client | null>(null);
  readonly assets = signal<ClientAsset[]>([]);
  readonly uploadType = signal<'logo' | 'header' | 'footer' | 'signature'>('logo');

  // uploading flags for edit asset uploads
  readonly uploading = signal<Record<string, boolean>>({ logo: false, header: false, footer: false, signature: false });

  // metadata editor helpers
  readonly metaPairs = signal<Record<string, { key: string; value: string }>>({});
  readonly newMetaKey = signal<string>('');
  readonly newMetaValue = signal<string>('');

  // pending confirmations
  readonly pendingDeleteClientId = signal<string | null>(null);
  readonly pendingDeleteAssetId = signal<string | null>(null);
  readonly pendingCancelCreate = signal<boolean>(false);
  readonly selectedClientError = signal<string | null>(null);


  async ngOnInit(): Promise<void> {
    const user = this.authService.user();
    if (!user) return;

    const org = this.orgService.organization();
    if (org) {
      this.selectedOrgId.set(org.id);
    } else {
      // Fallback for older setups: pick first organization
      const orgs = await this.orgService.getUserOrganizations(user.id);
      if (orgs.length > 0) this.selectedOrgId.set(orgs[0].id);
    }

    if (this.selectedOrgId()) await this.loadClients();
  }

  async loadClients(): Promise<void> {
    const orgId = this.selectedOrgId();
    if (!orgId) return;
    const list = await this.clientService.getClients(orgId);
    this.clients.set(list);
  }

  // Step 1: create client record and move to step 2
  async createClientStep1(): Promise<void> {
    const orgId = this.selectedOrgId();
    if (!orgId || !this.newName().trim()) return;

    this.creatingClient.set(true);
    this.newError.set(null);

    const payload: Partial<Client> = { name: this.newName().trim() };
    const email = this.newEmail().trim();
    if (email) payload.contact_email = email;
    const address = this.newAddress().trim();
    if (address) payload.address = address;
    const city = this.newCity().trim();
    if (city) payload.city = city;
    const state = this.newState().trim();
    if (state) payload.state = state;
    const postal = this.newPostalCode().trim();
    if (postal) payload.postal_code = postal;
    const website = this.newWebsite().trim();
    if (website) payload.website = website;

    console.info('Creating client (step1) with payload:', payload);

    // Timeout wrapper to detect hangs
    const createPromise = this.clientService.createClient(orgId, payload);
    const timeoutMs = 15000;
    let timeoutId: number | undefined;

    try {
        const res = await Promise.race([
        createPromise,
        new Promise((_, reject) => {
          timeoutId = window.setTimeout(() => reject(new Error('timeout')), timeoutMs);
        })
      ]);

      // normalize result shape
      const typed = res as { success: boolean; client?: Client; error?: string };

      // clear timeout if resolved
      if (timeoutId) clearTimeout(timeoutId);

      console.info('Create client response:', res);

      if (typed && typed.success && typed.client) {
        this.createdClient.set(typed.client);
        this.newStep.set(2);
        await this.loadCreatedClientAssets();
      } else {
        const msg = typed?.error || 'Failed to create client';
        console.error('Create client failed:', msg, res);
        this.newError.set(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
    } catch (err: unknown) {
      const isTimeout = err instanceof Error && err.message === 'timeout';
      if (isTimeout) {
        console.error('Create client request timed out');
        this.newError.set(`Request timed out after ${timeoutMs / 1000}s`);
      } else {
        console.error('Error creating client:', err);
        const message = err instanceof Error ? err.message : String(err);
        this.newError.set(message);
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      this.creatingClient.set(false);
    }
  }

  // Upload selected files to the created client
  async uploadSelectedAttachments(): Promise<void> {
    if (!this.createdClient()) return;
    const clientId = this.createdClient()!.id;
    const uploads: Array<Promise<{ success: boolean; asset?: ClientAsset; error?: string }>> = [];
    if (this.newLogoFile()) uploads.push(this.clientService.uploadClientAsset(clientId, 'logo', this.newLogoFile()!, this.newLogoFile()!.name));
    if (this.newHeaderFile()) uploads.push(this.clientService.uploadClientAsset(clientId, 'header', this.newHeaderFile()!, this.newHeaderFile()!.name));
    if (this.newFooterFile()) uploads.push(this.clientService.uploadClientAsset(clientId, 'footer', this.newFooterFile()!, this.newFooterFile()!.name));
    if (this.newSignatureFile()) uploads.push(this.clientService.uploadClientAsset(clientId, 'signature', this.newSignatureFile()!, this.newSignatureFile()!.name));

    if (uploads.length > 0) {
      await Promise.all(uploads);
      await this.loadCreatedClientAssets();
      // clear selected files
      this.newLogoFile.set(null);
      this.newHeaderFile.set(null);
      this.newFooterFile.set(null);
      this.newSignatureFile.set(null);
    }
  }

  async finishCreateClient(): Promise<void> {
    // upload any selected files then close modal and refresh list
    await this.uploadSelectedAttachments();
    this.openNew.set(false);
    this.newStep.set(1);
    this.createdClient.set(null);
    await this.loadClients();
  }

  promptCancelCreateFlow(): void {
    this.pendingCancelCreate.set(true);
  }

  async confirmCancelCreateFlow(): Promise<void> {
    if (this.createdClient()) {
      await this.clientService.deleteClient(this.createdClient()!.id);
    }

    // reset
    this.pendingCancelCreate.set(false);
    this.openNew.set(false);
    this.newStep.set(1);
    this.createdClient.set(null);
    this.newLogoFile.set(null);
    this.newHeaderFile.set(null);
    this.newFooterFile.set(null);
    this.newSignatureFile.set(null);
  }

  async loadCreatedClientAssets(): Promise<void> {
    if (!this.createdClient()) return;
    this.createdClientAssets.set(await this.clientService.getClientAssets(this.createdClient()!.id));
  }

  // Small helpers to get the latest asset of a given type
  getCreatedAssetByType(type: 'logo' | 'header' | 'footer' | 'signature'): ClientAsset | undefined {
    return this.createdClientAssets().find(a => a.type === type);
  }

  getAssetByType(type: 'logo' | 'header' | 'footer' | 'signature'): ClientAsset | undefined {
    return this.assets().find(a => a.type === type);
  }

  async deleteCreatedAsset(asset: ClientAsset): Promise<void> {
    if (!this.createdClient()) return;
    if (!confirm('Delete asset?')) return;
    await this.clientService.deleteClientAsset(asset.id);
    await this.loadCreatedClientAssets();
  }

  editClient(c: Client): void {
    // navigate to settings with client loaded or open modal (left minimal for now)
    this.selectedClient.set(c);
    // fire-and-forget prefetch
    void this.loadClientAssets(c.id);
  }

  async selectClient(c: Client): Promise<void> {
    this.selectedClient.set(c);
    await this.loadClientAssets(c.id);

    // initialize metadata editor from client (coerce undefined to empty string)
    const meta = (c.metadata || {});
    this.metaPairs.set(Object.fromEntries(Object.keys(meta).map(k => [k, { key: k, value: String(meta[k] ?? '') }])));
    this.newMetaKey.set('');
    this.newMetaValue.set('');
  }

  promptDeleteClient(clientId: string): void {
    this.pendingDeleteClientId.set(clientId);
  }

  async confirmDeleteClient(): Promise<void> {
    const id = this.pendingDeleteClientId();
    if (!id) return;
    await this.clientService.deleteClient(id);
    this.pendingDeleteClientId.set(null);
    if (this.selectedOrgId()) await this.loadClients();
  }

  async loadClientAssets(clientId: string): Promise<void> {
    this.assets.set(await this.clientService.getClientAssets(clientId));
  }

  async onAssetFile(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.selectedClient()) return;
    const res = await this.clientService.uploadClientAsset(this.selectedClient()!.id, this.uploadType(), file, file.name);
    if (res.success && res.asset) {
      this.assets.update(arr => [res.asset!, ...arr]);
    }
    input.value = '';
  }

  // Upload a single asset for the selected client (used in edit inline)
  async onEditAssetFile(ev: Event, type: 'logo' | 'header' | 'footer' | 'signature'): Promise<void> {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.selectedClient()) return;

    try {
      this.uploading.update(u => ({ ...u, [type]: true }));
      const res = await this.clientService.uploadClientAsset(this.selectedClient()!.id, type, file, file.name);
      if (res.success && res.asset) {
        // refresh assets and selected client convenience fields
        await this.loadClientAssets(this.selectedClient()!.id);
        this.selectedClient.set(await this.clientService.getClientWithAssets(this.selectedClient()!.id));
      }
    } finally {
      this.uploading.update(u => ({ ...u, [type]: false }));
      input.value = '';
    }
  }

  // Delete the most recent asset of a given type for the selected client
  async deleteAssetByType(type: 'logo' | 'header' | 'footer' | 'signature'): Promise<void> {
    if (!this.selectedClient()) return;
    const asset = this.assets().find(a => a.type === type);
    if (!asset) {
      alert('No asset of this type to delete');
      return;
    }

    if (!confirm('Delete asset?')) return;
    await this.clientService.deleteClientAsset(asset.id);
    await this.loadClientAssets(this.selectedClient()!.id);
    this.selectedClient.set(await this.clientService.getClientWithAssets(this.selectedClient()!.id));
  }

  onNewClientFile(ev: Event, type: 'logo' | 'header' | 'footer' | 'signature'): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (type === 'logo') this.newLogoFile.set(file);
    if (type === 'header') this.newHeaderFile.set(file);
    if (type === 'footer') this.newFooterFile.set(file);
    if (type === 'signature') this.newSignatureFile.set(file);
  }

  metadataKeys(): string[] {
    return Object.keys(this.metaPairs());
  }

  addMeta(): void {
    const key = this.newMetaKey().trim();
    if (!key) return;
    this.metaPairs.update(mp => ({ ...mp, [key]: { key, value: this.newMetaValue() } }));
    this.newMetaKey.set('');
    this.newMetaValue.set('');
  }

  removeMeta(key: string): void {
    this.metaPairs.update(mp => {
      const copy = { ...mp };
      delete copy[key];
      return copy;
    });
  }

  // bound helper for template to update a meta value safely
  onMetaValueChange = (key: string, value: string): void => {
    this.metaPairs.update(mp => ({ ...mp, [key]: { ...mp[key], key, value } }));
  };

  async saveClientChanges(): Promise<void> {
    if (!this.selectedClient()) return;
    const sc = this.selectedClient()!;
    const updates = {
      name: sc.name,
      contact_email: sc.contact_email,
      contact_phone: sc.contact_phone,
      address: sc.address,
      city: sc.city,
      state: sc.state,
      postal_code: sc.zipCode || sc.postal_code,
      country: sc.country,
      logo: sc.logo,
      header: sc.header,
      footer: sc.footer,
      signature: sc.signature,
      metadata: Object.fromEntries(this.metadataKeys().map(k => [k, this.metaPairs()[k].value])) as Record<string, string>
    } as Partial<Client>;

    const res = await this.clientService.updateClient(sc.id, updates);
    if (res.success && this.selectedOrgId()) {
      await this.loadClients();
      this.selectedClient.set(await this.clientService.getClientWithAssets(sc.id));
    }
  }

  promptDeleteAsset(asset: ClientAsset): void {
    this.pendingDeleteAssetId.set(asset.id);
  }

  async confirmDeleteAsset(): Promise<void> {
    const id = this.pendingDeleteAssetId();
    if (!id) return;
    await this.clientService.deleteClientAsset(id);
    this.pendingDeleteAssetId.set(null);
    if (this.selectedClient()) await this.loadClientAssets(this.selectedClient()!.id);
  }
}
