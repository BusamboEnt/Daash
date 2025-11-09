import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert, Platform } from 'react-native';
import { validateKYCDocumentFile, validateAvatarFile, STORAGE_LIMITS } from '../utils/fileUpload';

export interface PickedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
  width?: number;
  height?: number;
}

/**
 * Image Picker Service
 * Handles image/document selection from camera or gallery with compression
 */
export class ImagePickerService {
  /**
   * Request camera permissions
   */
  static async requestCameraPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos. Please enable it in settings.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  /**
   * Request media library permissions
   */
  static async requestMediaLibraryPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Photo library permission is required to select images. Please enable it in settings.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting media library permissions:', error);
      return false;
    }
  }

  /**
   * Take a photo with camera
   */
  static async takePhoto(
    compress: boolean = true,
    quality: number = 0.8
  ): Promise<PickedFile | null> {
    try {
      // Request permissions
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) return null;

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: quality,
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      let fileUri = asset.uri;
      let fileSize = asset.fileSize || 0;

      // Compress if needed and file is too large
      if (compress && fileSize > STORAGE_LIMITS.KYC_DOCUMENTS.MAX_SIZE_BYTES) {
        const compressed = await this.compressImage(fileUri, STORAGE_LIMITS.KYC_DOCUMENTS.MAX_SIZE_MB);
        fileUri = compressed.uri;
        fileSize = compressed.size;
      }

      return {
        uri: fileUri,
        name: `photo_${Date.now()}.jpg`,
        type: 'image/jpeg',
        size: fileSize,
        width: asset.width,
        height: asset.height,
      };
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      return null;
    }
  }

  /**
   * Pick an image from gallery
   */
  static async pickImage(
    compress: boolean = true,
    quality: number = 0.8,
    allowsMultiple: boolean = false
  ): Promise<PickedFile[] | null> {
    try {
      // Request permissions
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) return null;

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: !allowsMultiple,
        aspect: [4, 3],
        quality: quality,
        allowsMultipleSelection: allowsMultiple,
      });

      if (result.canceled) {
        return null;
      }

      const files: PickedFile[] = [];

      for (const asset of result.assets) {
        let fileUri = asset.uri;
        let fileSize = asset.fileSize || 0;

        // Compress if needed and file is too large
        if (compress && fileSize > STORAGE_LIMITS.KYC_DOCUMENTS.MAX_SIZE_BYTES) {
          const compressed = await this.compressImage(fileUri, STORAGE_LIMITS.KYC_DOCUMENTS.MAX_SIZE_MB);
          fileUri = compressed.uri;
          fileSize = compressed.size;
        }

        files.push({
          uri: fileUri,
          name: `image_${Date.now()}_${files.length}.jpg`,
          type: 'image/jpeg',
          size: fileSize,
          width: asset.width,
          height: asset.height,
        });
      }

      return files;
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
      return null;
    }
  }

  /**
   * Pick a document (PDF or image)
   */
  static async pickDocument(): Promise<PickedFile | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return null;
      }

      const file = result.assets[0];

      return {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
        size: file.size || 0,
      };
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document. Please try again.');
      return null;
    }
  }

  /**
   * Compress image to target size
   */
  static async compressImage(
    uri: string,
    maxSizeMB: number,
    quality: number = 0.8
  ): Promise<{ uri: string; size: number }> {
    try {
      let compressedUri = uri;
      let currentQuality = quality;
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        const manipulated = await ImageManipulator.manipulateAsync(
          compressedUri,
          [{ resize: { width: 1920 } }], // Resize to max 1920px width
          {
            compress: currentQuality,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );

        // Get file size (estimate based on base64 if needed)
        const response = await fetch(manipulated.uri);
        const blob = await response.blob();
        const size = blob.size;

        console.log(`Compression attempt ${attempts + 1}: ${(size / 1024 / 1024).toFixed(2)}MB at quality ${currentQuality}`);

        if (size <= maxSizeMB * 1024 * 1024) {
          return { uri: manipulated.uri, size };
        }

        // Reduce quality for next attempt
        compressedUri = manipulated.uri;
        currentQuality -= 0.1;
        attempts++;

        if (currentQuality < 0.3) {
          // If quality is too low, try reducing dimensions more aggressively
          const smallerManipulated = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1280 } }],
            {
              compress: 0.7,
              format: ImageManipulator.SaveFormat.JPEG,
            }
          );

          const smallerResponse = await fetch(smallerManipulated.uri);
          const smallerBlob = await smallerResponse.blob();
          return { uri: smallerManipulated.uri, size: smallerBlob.size };
        }
      }

      // Return last compressed version even if still too large
      const finalResponse = await fetch(compressedUri);
      const finalBlob = await finalResponse.blob();
      return { uri: compressedUri, size: finalBlob.size };
    } catch (error) {
      console.error('Error compressing image:', error);
      // Return original if compression fails
      const response = await fetch(uri);
      const blob = await response.blob();
      return { uri, size: blob.size };
    }
  }

  /**
   * Validate and pick KYC document
   */
  static async pickKYCDocument(
    documentType: string,
    options: { allowCamera?: boolean; allowGallery?: boolean; allowPDF?: boolean } = {}
  ): Promise<PickedFile | null> {
    const { allowCamera = true, allowGallery = true, allowPDF = true } = options;

    try {
      // Show options
      const buttons: string[] = [];
      if (allowCamera) buttons.push('Take Photo');
      if (allowGallery) buttons.push('Choose from Gallery');
      if (allowPDF) buttons.push('Select PDF');
      buttons.push('Cancel');

      return new Promise((resolve) => {
        Alert.alert(
          `Upload ${documentType}`,
          'Choose how you want to upload your document',
          [
            ...(allowCamera ? [{
              text: 'Take Photo',
              onPress: async () => {
                const file = await this.takePhoto(true, 0.8);
                if (file) {
                  const validation = validateKYCDocumentFile(file.size, file.type);
                  if (!validation.valid) {
                    Alert.alert('Invalid File', validation.error);
                    resolve(null);
                    return;
                  }
                }
                resolve(file);
              },
            }] : []),
            ...(allowGallery ? [{
              text: 'Choose from Gallery',
              onPress: async () => {
                const files = await this.pickImage(true, 0.8, false);
                if (files && files.length > 0) {
                  const file = files[0];
                  const validation = validateKYCDocumentFile(file.size, file.type);
                  if (!validation.valid) {
                    Alert.alert('Invalid File', validation.error);
                    resolve(null);
                    return;
                  }
                  resolve(file);
                } else {
                  resolve(null);
                }
              },
            }] : []),
            ...(allowPDF ? [{
              text: 'Select PDF',
              onPress: async () => {
                const file = await this.pickDocument();
                if (file) {
                  const validation = validateKYCDocumentFile(file.size, file.type);
                  if (!validation.valid) {
                    Alert.alert('Invalid File', validation.error);
                    resolve(null);
                    return;
                  }
                }
                resolve(file);
              },
            }] : []),
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(null),
            },
          ]
        );
      });
    } catch (error) {
      console.error('Error picking KYC document:', error);
      return null;
    }
  }

  /**
   * Pick avatar image
   */
  static async pickAvatar(): Promise<PickedFile | null> {
    try {
      return new Promise((resolve) => {
        Alert.alert(
          'Upload Avatar',
          'Choose how you want to upload your profile picture',
          [
            {
              text: 'Take Photo',
              onPress: async () => {
                const file = await this.takePhoto(true, 0.9);
                if (file) {
                  const validation = validateAvatarFile(file.size, file.type);
                  if (!validation.valid) {
                    Alert.alert('Invalid File', validation.error);
                    resolve(null);
                    return;
                  }
                }
                resolve(file);
              },
            },
            {
              text: 'Choose from Gallery',
              onPress: async () => {
                const files = await this.pickImage(true, 0.9, false);
                if (files && files.length > 0) {
                  const file = files[0];
                  const validation = validateAvatarFile(file.size, file.type);
                  if (!validation.valid) {
                    Alert.alert('Invalid File', validation.error);
                    resolve(null);
                    return;
                  }
                  resolve(file);
                } else {
                  resolve(null);
                }
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(null),
            },
          ]
        );
      });
    } catch (error) {
      console.error('Error picking avatar:', error);
      return null;
    }
  }
}
