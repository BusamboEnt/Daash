/**
 * File Upload Utilities for Daash Wallet
 * Handles file validation, size checking, and upload preparation
 */

// Storage bucket limits (matching Supabase configuration)
export const STORAGE_LIMITS = {
  AVATARS: {
    MAX_SIZE_MB: 10,
    MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    BUCKET_NAME: 'avatars',
  },
  KYC_DOCUMENTS: {
    MAX_SIZE_MB: 5,
    MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ],
    BUCKET_NAME: 'kyc-documents',
  },
} as const;

/**
 * Format bytes to human-readable size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate file size for avatar upload
 */
export const validateAvatarSize = (fileSizeBytes: number): { valid: boolean; error?: string } => {
  if (fileSizeBytes > STORAGE_LIMITS.AVATARS.MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `Avatar must be less than ${STORAGE_LIMITS.AVATARS.MAX_SIZE_MB}MB. Current size: ${formatFileSize(fileSizeBytes)}`,
    };
  }
  return { valid: true };
};

/**
 * Validate file size for KYC document upload
 */
export const validateKYCDocumentSize = (
  fileSizeBytes: number
): { valid: boolean; error?: string } => {
  if (fileSizeBytes > STORAGE_LIMITS.KYC_DOCUMENTS.MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `Document must be less than ${STORAGE_LIMITS.KYC_DOCUMENTS.MAX_SIZE_MB}MB. Current size: ${formatFileSize(fileSizeBytes)}`,
    };
  }
  return { valid: true };
};

/**
 * Validate file type for avatar
 */
export const validateAvatarType = (mimeType: string): { valid: boolean; error?: string } => {
  const allowedTypes = STORAGE_LIMITS.AVATARS.ALLOWED_TYPES as readonly string[];
  if (!allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: JPG, PNG, WebP`,
    };
  }
  return { valid: true };
};

/**
 * Validate file type for KYC document
 */
export const validateKYCDocumentType = (
  mimeType: string
): { valid: boolean; error?: string } => {
  const allowedTypes = STORAGE_LIMITS.KYC_DOCUMENTS.ALLOWED_TYPES as readonly string[];
  if (!allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: JPG, PNG, WebP, PDF`,
    };
  }
  return { valid: true };
};

/**
 * Validate avatar file (size + type)
 */
export const validateAvatarFile = (
  fileSizeBytes: number,
  mimeType: string
): { valid: boolean; error?: string } => {
  // Check file type first
  const typeValidation = validateAvatarType(mimeType);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // Check file size
  const sizeValidation = validateAvatarSize(fileSizeBytes);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  return { valid: true };
};

/**
 * Validate KYC document file (size + type)
 */
export const validateKYCDocumentFile = (
  fileSizeBytes: number,
  mimeType: string
): { valid: boolean; error?: string } => {
  // Check file type first
  const typeValidation = validateKYCDocumentType(mimeType);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // Check file size
  const sizeValidation = validateKYCDocumentSize(fileSizeBytes);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  return { valid: true };
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

/**
 * Generate safe filename for storage
 */
export const generateSafeFilename = (
  userId: string,
  originalFilename: string,
  documentType?: string
): string => {
  const timestamp = Date.now();
  const extension = getFileExtension(originalFilename);
  const prefix = documentType ? `${documentType}_` : '';

  return `${userId}/${prefix}${timestamp}.${extension}`;
};

/**
 * Compress image before upload (optional utility for future use)
 * This is a placeholder - actual implementation would use react-native-image-picker
 * or similar library with compression options
 */
export const compressImage = async (
  imageUri: string,
  maxSizeMB: number
): Promise<{ uri: string; size: number }> => {
  // TODO: Implement image compression using react-native-image-picker or similar
  // For now, return original
  console.warn('Image compression not yet implemented');
  return { uri: imageUri, size: 0 };
};

/**
 * File upload preparation helper
 */
export interface PreparedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

export const prepareFileForUpload = (
  file: PreparedFile,
  bucketType: 'avatars' | 'kyc-documents'
): { valid: boolean; error?: string; file?: PreparedFile } => {
  const validator =
    bucketType === 'avatars' ? validateAvatarFile : validateKYCDocumentFile;

  const validation = validator(file.size, file.type);

  if (!validation.valid) {
    return { valid: false, error: validation.error };
  }

  return { valid: true, file };
};

/**
 * Get upload progress percentage
 */
export const calculateUploadProgress = (loaded: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((loaded / total) * 100);
};

/**
 * Estimate upload time based on file size and connection speed
 * Assumes average upload speed of 1 Mbps (125 KB/s)
 */
export const estimateUploadTime = (fileSizeBytes: number): string => {
  const averageSpeedKBps = 125; // 1 Mbps
  const fileSizeKB = fileSizeBytes / 1024;
  const estimatedSeconds = fileSizeKB / averageSpeedKBps;

  if (estimatedSeconds < 60) {
    return `~${Math.ceil(estimatedSeconds)} seconds`;
  } else {
    const minutes = Math.ceil(estimatedSeconds / 60);
    return `~${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
};
