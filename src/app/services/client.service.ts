import { Injectable, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environment';

export interface Client {
  id: string;
  organization_id: string;
  name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  zipCode?: string; // convenience mapping for UI
  country?: string;
  website?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  // standard asset URLs
  logo?: string;
  header?: string;
  footer?: string;
  signature?: string;
  // arbitrary custom key/value metadata
  metadata?: Record<string, string>;
}

export interface ClientAsset {
  id: string;
  client_id: string;
  type: 'logo' | 'header' | 'footer' | 'signature';
  name: string;
  url?: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private supabase: ReturnType<typeof createClient>;
  private readonly clients = signal<Client[] | null>(null);

  readonly clientList = this.clients.asReadonly();

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  async getClients(orgId: string): Promise<Client[]> {
    try {
      const { data, error } = await (this.supabase
        .from('clients')
        .select('*')
        .eq('organization_id', orgId)
        .order('name', { ascending: true }) as any);

      if (error) throw error;
      this.clients.set(data || []);
      return data || [];
    } catch (error: unknown) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }

  async getClient(clientId: string): Promise<Client | null> {
    try {
      const { data, error } = await this.supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      return data || null;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching client:', message);
      return null;
    }
  }

  async createClient(orgId: string, payload: Partial<Client>): Promise<{ success: boolean; client?: Client; error?: string }> {
    try {
      const insertPayload: Partial<Client> & { organization_id: string } = { ...payload, organization_id: orgId };
      // ensure metadata is JSONB
      if (payload.metadata && typeof payload.metadata === 'object') insertPayload.metadata = payload.metadata;

      const { data, error } = await (this.supabase
        .from('clients')
        .insert(insertPayload as any)
        .select()
        .single() as any);

      if (error) throw error;
      // refresh clients cache
      await this.getClients(orgId);
      return { success: true, client: data as Client };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error creating client:', message);
      return { success: false, error: message };
    }
  }

  async updateClient(clientId: string, updates: Partial<Client>): Promise<{ success: boolean; error?: string }> {
    try {
      const payload: Partial<Client> = { ...updates };
      if (updates.metadata && typeof updates.metadata === 'object') payload.metadata = updates.metadata;

      const { error } = await ((this.supabase as any)
        .from('clients')
        .update(payload as any)
        .eq('id', clientId) as any);

      if (error) throw error;
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error updating client:', message);
      return { success: false, error: message };
    }
  }

  async deleteClient(clientId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await (this.supabase
        .from('clients')
        .delete()
        .eq('id', clientId) as any);

      if (error) throw error;
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error deleting client:', message);
      return { success: false, error: message };
    }
  }

  async getClientAssets(clientId: string): Promise<ClientAsset[]> {
    try {
      const { data, error } = await (this.supabase
        .from('client_assets')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      return data || [];
    } catch (error: unknown) {
      console.error('Error fetching client assets:', error);
      return [];
    }
  }

  // Uploads file into org bucket under clients/<clientId>/ and records client_assets row
  async uploadClientAsset(clientId: string, type: 'logo' | 'header' | 'footer' | 'signature', file: File, name?: string): Promise<{ success: boolean; asset?: ClientAsset; error?: string }> {
    try {
      // get client to find organization
      const client = await this.getClient(clientId);
      if (!client) throw new Error('Client not found');

      const orgId = client.organization_id;
      const bucketName = `org-${orgId}`;
      const fileExt = file.name.split('.').pop();
      const path = `clients/${clientId}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await this.supabase.storage
        .from(bucketName)
        .upload(path, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data } = this.supabase.storage.from(bucketName).getPublicUrl(path);
      const dataPublic = data as { publicUrl?: string } | null;
      const publicUrl = dataPublic?.publicUrl ?? null;

      const { data: assetData, error } = await (this.supabase
        .from('client_assets')
        .insert({ client_id: clientId, type, name: name || file.name, url: publicUrl } as any)
        .select()
        .single() as any);

      if (error) throw error;

      return { success: true, asset: assetData as ClientAsset };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error uploading client asset:', message);
      return { success: false, error: message };
    }
  }

  async deleteClientAsset(assetId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: asset, error: selErr } = await (this.supabase.from('client_assets').select('*').eq('id', assetId).single() as any);
      if (selErr) throw selErr;

      if (asset && asset.url) {
        // Try removing object from storage (best-effort)
        const m = (asset.url as string).match(/\/org-([^/]+)\/(.+)$/);
        if (m) {
          const bucket = `org-${m[1]}`;
          const path = m[2];
          try {
            await this.supabase.storage.from(bucket).remove([path]);
          } catch (err) {
            // ignore
          }
        }
      }

      const { error } = await this.supabase.from('client_assets').delete().eq('id', assetId);
      if (error) throw error;
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error deleting client asset:', message);
      return { success: false, error: message };
    }
  }

  // Convenience: fetch client and attach the most recent asset url for types
  async getClientWithAssets(clientId: string): Promise<Client | null> {
    try {
      const client = await this.getClient(clientId);
      if (!client) return null;

      const assets = await this.getClientAssets(clientId);
      for (const a of assets) {
        if (a.type === 'logo' && !client.logo && typeof a.url === 'string') client.logo = a.url;
        if (a.type === 'header' && !client.header && typeof a.url === 'string') client.header = a.url;
        if (a.type === 'footer' && !client.footer && typeof a.url === 'string') client.footer = a.url;
        if (a.type === 'signature' && !client.signature && typeof a.url === 'string') client.signature = a.url;
      }

      // convenience mapping for UI
      client.zipCode = client.postal_code || client.zipCode;

      return client;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error getting client with assets:', message);
      return null;
    }
  }
}
