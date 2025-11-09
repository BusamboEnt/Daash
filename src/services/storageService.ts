import { supabase, BUCKETS, isSupabaseConfigured } from '../config/supabase';
import {
  validateAvatarFile,
  validateKYCDocumentFile,
  generateSafeFilename,
  PreparedFile,
  STORAGE_LIMITS,
} from '../utils/fileUpload';

/**
 * Storage Service for Supabase File Uploads
 * Handles avatar and KYC document uploads with validation
 */
export class StorageService {
  /**
   * Upload avatar image
   */
  static async uploadAvatar(
    userId: string,
    file: PreparedFile,
    onProgress?: (progress: number) => void
  ): Promise<{ url?: string; error?: string }> {
    try {
      if (!isSupabaseConfigured()) {
        return { error: 'Supabase not configured' };
      }

      // Validate file
      const validation = validateAvatarFile(file.size, file.type);
      if (!validation.valid) {
        return { error: validation.error };
      }

      // Generate safe filename
      const filename = generateSafeFilename(userId, file.name);

      // Upload file
      const { data, error } = await supabase.storage
        .from(BUCKETS.AVATARS)
        .upload(filename, file as any, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (error) {
        console.error('Error uploading avatar:', error);
        return { error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKETS.AVATARS)
        .getPublicUrl(data.path);

      return { url: urlData.publicUrl };
    } catch (error: any) {
      console.error('Error in uploadAvatar:', error);
      return { error: error.message || 'Failed to upload avatar' };
    }
  }

  /**
   * Upload KYC document
   */
  static async uploadKYCDocument(
    userId: string,
    kycVerificationId: string,
    documentType: string,
    file: PreparedFile,
    onProgress?: (progress: number) => void
  ): Promise<{ path?: string; error?: string }> {
    try {
      if (!isSupabaseConfigured()) {
        return { error: 'Supabase not configured' };
      }

      // Validate file
      const validation = validateKYCDocumentFile(file.size, file.type);
      if (!validation.valid) {
        return { error: validation.error };
      }

      // Generate safe filename with document type
      const filename = generateSafeFilename(userId, file.name, documentType);

      // Upload file to private bucket
      const { data, error } = await supabase.storage
        .from(BUCKETS.KYC_DOCUMENTS)
        .upload(filename, file as any, {
          cacheControl: '3600',
          upsert: false, // Don't allow overwriting KYC docs
          contentType: file.type,
        });

      if (error) {
        console.error('Error uploading KYC document:', error);
        return { error: error.message };
      }

      console.log('KYC document uploaded:', data.path);
      return { path: data.path };
    } catch (error: any) {
      console.error('Error in uploadKYCDocument:', error);
      return { error: error.message || 'Failed to upload document' };
    }
  }

  /**
   * Delete avatar
   */
  static async deleteAvatar(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!isSupabaseConfigured()) {
        return { success: false, error: 'Supabase not configured' };
      }

      const { error } = await supabase.storage.from(BUCKETS.AVATARS).remove([filePath]);

      if (error) {
        console.error('Error deleting avatar:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in deleteAvatar:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get avatar URL
   */
  static getAvatarUrl(filePath: string): string {
    if (!isSupabaseConfigured()) {
      return '';
    }

    const { data } = supabase.storage.from(BUCKETS.AVATARS).getPublicUrl(filePath);
    return data.publicUrl;
  }

  /**
   * Get KYC document signed URL (private access)
   */
  static async getKYCDocumentUrl(
    filePath: string,
    expiresIn: number = 3600
  ): Promise<{ url?: string; error?: string }> {
    try {
      if (!isSupabaseConfigured()) {
        return { error: 'Supabase not configured' };
      }

      const { data, error } = await supabase.storage
        .from(BUCKETS.KYC_DOCUMENTS)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error('Error getting KYC document URL:', error);
        return { error: error.message };
      }

      return { url: data.signedUrl };
    } catch (error: any) {
      console.error('Error in getKYCDocumentUrl:', error);
      return { error: error.message };
    }
  }

  /**
   * List user's KYC documents
   */
  static async listKYCDocuments(
    userId: string
  ): Promise<{ files?: any[]; error?: string }> {
    try {
      if (!isSupabaseConfigured()) {
        return { error: 'Supabase not configured' };
      }

      const { data, error } = await supabase.storage
        .from(BUCKETS.KYC_DOCUMENTS)
        .list(userId);

      if (error) {
        console.error('Error listing KYC documents:', error);
        return { error: error.message };
      }

      return { files: data };
    } catch (error: any) {
      console.error('Error in listKYCDocuments:', error);
      return { error: error.message };
    }
  }

  /**
   * Get storage limits for display
   */
  static getStorageLimits() {
    return {
      avatars: {
        maxSizeMB: STORAGE_LIMITS.AVATARS.MAX_SIZE_MB,
        allowedTypes: ['JPG', 'PNG', 'WebP'],
      },
      kycDocuments: {
        maxSizeMB: STORAGE_LIMITS.KYC_DOCUMENTS.MAX_SIZE_MB,
        allowedTypes: ['JPG', 'PNG', 'WebP', 'PDF'],
      },
    };
  }
}
