import { Injectable, signal, inject } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../environment';
import { OrganizationService } from './organization.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly orgService = inject(OrganizationService);
  private supabase: SupabaseClient;
  private readonly currentUser = signal<User | null>(null);
  private readonly currentSession = signal<Session | null>(null);
  private readonly loading = signal<boolean>(true);
  private readonly errorMessage = signal<string | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly session = this.currentSession.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly error = this.errorMessage.asReadonly();

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );

    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      this.currentSession.set(session);
      this.currentUser.set(session?.user ?? null);

      // Listen for auth changes
      this.supabase.auth.onAuthStateChange((_event, session) => {
        this.currentSession.set(session);
        this.currentUser.set(session?.user ?? null);
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.errorMessage.set('Failed to initialize authentication');
    } finally {
      this.loading.set(false);
    }
  }

  async signUp(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    this.errorMessage.set(null);
    this.loading.set(true);

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        this.errorMessage.set(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        this.currentUser.set(data.user);
        this.currentSession.set(data.session);
        return { success: true };
      }

      return { success: false, error: 'Signup failed' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      this.errorMessage.set(message);
      return { success: false, error: message };
    } finally {
      this.loading.set(false);
    }
  }

  async signUpWithOrg(email: string, password: string, orgName: string): Promise<{ success: boolean; error?: any }> {
    this.errorMessage.set(null);
    this.loading.set(true);

    try {
      // First, sign up the user
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        this.errorMessage.set(error.message);
        return { success: false, error };
      }

      if (!data.user) {
        return { success: false, error: { message: 'Signup failed - no user created' } };
      }

      // Create organization for the user
      const orgResult = await this.orgService.createOrganization(data.user.id, orgName);

      if (!orgResult.success) {
        // If org creation fails, we should ideally rollback the user creation
        // For now, we'll just return the error
        this.errorMessage.set(orgResult.error || 'Failed to create organization');
        return { success: false, error: { message: orgResult.error } };
      }

      this.currentUser.set(data.user);
      this.currentSession.set(data.session);
      
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      this.errorMessage.set(message);
      return { success: false, error: { message } };
    } finally {
      this.loading.set(false);
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    this.errorMessage.set(null);
    this.loading.set(true);

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.errorMessage.set(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        this.currentUser.set(data.user);
        this.currentSession.set(data.session);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      this.errorMessage.set(message);
      return { success: false, error: message };
    } finally {
      this.loading.set(false);
    }
  }

  async signOut(): Promise<void> {
    this.loading.set(true);
    try {
      await this.supabase.auth.signOut();
      this.currentUser.set(null);
      this.currentSession.set(null);
    } catch (error) {
      console.error('Error signing out:', error);
      this.errorMessage.set('Failed to sign out');
    } finally {
      this.loading.set(false);
    }
  }

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    this.errorMessage.set(null);
    this.loading.set(true);

    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        this.errorMessage.set(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      this.errorMessage.set(message);
      return { success: false, error: message };
    } finally {
      this.loading.set(false);
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}
