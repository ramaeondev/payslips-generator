import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environment';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  tax_id?: string;
  created_at: string;
  updated_at: string;

}

export interface UserOrganization {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'admin' | 'member' | 'viewer';
  created_at: string;
}



@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private supabase: SupabaseClient;
  private readonly currentOrg = signal<Organization | null>(null);
  private readonly loading = signal<boolean>(false);
  private readonly errorMessage = signal<string | null>(null);

  readonly organization = this.currentOrg.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly error = this.errorMessage.asReadonly();

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  /**
   * Create a new organization and link it to the user
   * Uses a database function to bypass RLS during signup
   */
  async createOrganization(userId: string, orgName: string): Promise<{ success: boolean; organization?: Organization; error?: string }> {
    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      // Create slug from org name
      const slug = orgName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Call the database function to create org and link user
      const { data, error } = await this.supabase
        .rpc('create_organization_with_user', {
          p_user_id: userId,
          p_org_name: orgName,
          p_org_slug: slug
        });

      if (error) {
        throw error;
      }

      const org = data?.[0] as Organization;

      if (!org) {
        throw new Error('Failed to create organization');
      }

      // Storage bucket is now created automatically by the database function

      this.currentOrg.set(org);
      return { success: true, organization: org };
    } catch (error: any) {
      console.error('Error creating organization:', error);
      this.errorMessage.set(error.message);
      return { success: false, error: error.message };
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Create a storage bucket for the organization
   */
  private async createOrgBucket(orgId: string): Promise<void> {
    try {
      const bucketName = `org-${orgId}`;
      
      // Create bucket
      const { error } = await this.supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      });

      if (error && !error.message.includes('already exists')) {
        console.error('Error creating bucket:', error);
      }
    } catch (error) {
      console.error('Error creating organization bucket:', error);
    }
  }

  /**
   * Get current user's organizations
   */
  async getUserOrganizations(userId: string): Promise<Organization[]> {
    this.loading.set(true);

    try {
      const { data, error } = await this.supabase
        .from('user_organizations')
        .select(`
          organization_id,
          role,
          organizations (*)
        `)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      const orgs = (data || []).map((item: any) => item.organizations as Organization);
      
      // Set first org as current if available
      if (orgs.length > 0 && !this.currentOrg()) {
        this.currentOrg.set(orgs[0]);
      }

      return orgs;
    } catch (error: any) {
      console.error('Error fetching organizations:', error);
      this.errorMessage.set(error.message);
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Get organization by ID
   */
  async getOrganization(orgId: string): Promise<Organization | null> {
    this.loading.set(true);

    try {
      const { data, error } = await this.supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();

      if (error) {
        throw error;
      }

      this.currentOrg.set(data);
      return data;
    } catch (error: any) {
      console.error('Error fetching organization:', error);
      this.errorMessage.set(error.message);
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Update organization
   */
  async updateOrganization(orgId: string, updates: Partial<Organization>): Promise<{ success: boolean; error?: string }> {
    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const { data, error } = await this.supabase
        .from('organizations')
        .update(updates)
        .eq('id', orgId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      this.currentOrg.set(data);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating organization:', error);
      this.errorMessage.set(error.message);
      return { success: false, error: error.message };
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Upload organization logo (kept for backward compatibility)
   */
  async uploadLogo(orgId: string, file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    this.loading.set(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const bucketName = `org-${orgId}`;

      // Upload file
      const { error: uploadError } = await this.supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = this.supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      const publicUrl = (data as any)?.publicUrl;

      // Update organization with logo URL
      await this.updateOrganization(orgId, { logo_url: publicUrl });

      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      this.errorMessage.set(error.message);
      return { success: false, error: error.message };
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Upload an organization asset (file)
   */




  /**
   * Set current organization
   */
  setCurrentOrganization(org: Organization): void {
    this.currentOrg.set(org);
  }

  /**
   * Clear current organization
   */
  clearCurrentOrganization(): void {
    this.currentOrg.set(null);
  }
}
