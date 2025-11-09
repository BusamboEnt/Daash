import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Upload, CheckCircle2 } from 'lucide-react-native';
import { ImagePickerService, PickedFile } from '../services/imagePickerService';
import { StorageService } from '../services/storageService';
import { SupabaseService } from '../services/supabaseService';
import { DocumentPreview } from '../components/DocumentPreview';
import { UploadProgress } from '../components/UploadProgress';

interface DocumentUploadScreenProps {
  userId: string;
  kycVerificationId: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

interface UploadStatus {
  documentType: string;
  file: PickedFile | null;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

const DOCUMENT_TYPES = [
  { id: 'passport', label: 'Passport', required: true },
  { id: 'drivers_license', label: "Driver's License", required: false },
  { id: 'national_id', label: 'National ID', required: false },
  { id: 'proof_of_address', label: 'Proof of Address', required: true },
  { id: 'selfie', label: 'Selfie', required: true },
];

export default function DocumentUploadScreen({
  userId,
  kycVerificationId,
  onComplete,
  onCancel,
}: DocumentUploadScreenProps) {
  const [uploads, setUploads] = useState<Record<string, UploadStatus>>(
    DOCUMENT_TYPES.reduce((acc, doc) => ({
      ...acc,
      [doc.id]: {
        documentType: doc.id,
        file: null,
        progress: 0,
        status: 'idle',
      },
    }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle document selection
   */
  const handleSelectDocument = async (documentType: string) => {
    try {
      const file = await ImagePickerService.pickKYCDocument(
        DOCUMENT_TYPES.find(d => d.id === documentType)?.label || documentType,
        {
          allowCamera: true,
          allowGallery: true,
          allowPDF: documentType !== 'selfie', // No PDF for selfies
        }
      );

      if (file) {
        setUploads(prev => ({
          ...prev,
          [documentType]: {
            ...prev[documentType],
            file,
            status: 'idle',
            error: undefined,
          },
        }));
      }
    } catch (error) {
      console.error('Error selecting document:', error);
      Alert.alert('Error', 'Failed to select document');
    }
  };

  /**
   * Remove selected document
   */
  const handleRemoveDocument = (documentType: string) => {
    setUploads(prev => ({
      ...prev,
      [documentType]: {
        ...prev[documentType],
        file: null,
        progress: 0,
        status: 'idle',
        error: undefined,
      },
    }));
  };

  /**
   * Upload single document
   */
  const uploadDocument = async (documentType: string): Promise<boolean> => {
    const upload = uploads[documentType];
    if (!upload.file) return false;

    try {
      setUploads(prev => ({
        ...prev,
        [documentType]: { ...prev[documentType], status: 'uploading', progress: 0 },
      }));

      // Simulate progress (in production, use actual upload progress)
      const progressInterval = setInterval(() => {
        setUploads(prev => ({
          ...prev,
          [documentType]: {
            ...prev[documentType],
            progress: Math.min(prev[documentType].progress + 10, 90),
          },
        }));
      }, 200);

      // Upload to Supabase
      const result = await StorageService.uploadKYCDocument(
        userId,
        kycVerificationId,
        documentType,
        upload.file
      );

      clearInterval(progressInterval);

      if (result.error) {
        setUploads(prev => ({
          ...prev,
          [documentType]: {
            ...prev[documentType],
            status: 'error',
            error: result.error,
            progress: 0,
          },
        }));
        return false;
      }

      // Save document metadata to database
      if (result.path) {
        await SupabaseService.saveKYCDocument(kycVerificationId, {
          document_type: documentType,
          file_path: result.path,
          file_name: upload.file.name,
          file_size: upload.file.size,
          mime_type: upload.file.type,
          status: 'pending',
        });
      }

      setUploads(prev => ({
        ...prev,
        [documentType]: {
          ...prev[documentType],
          status: 'success',
          progress: 100,
        },
      }));

      return true;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      setUploads(prev => ({
        ...prev,
        [documentType]: {
          ...prev[documentType],
          status: 'error',
          error: error.message || 'Upload failed',
          progress: 0,
        },
      }));
      return false;
    }
  };

  /**
   * Submit all documents
   */
  const handleSubmit = async () => {
    try {
      // Validate required documents
      const requiredDocs = DOCUMENT_TYPES.filter(d => d.required);
      const missingDocs = requiredDocs.filter(d => !uploads[d.id].file);

      if (missingDocs.length > 0) {
        Alert.alert(
          'Missing Documents',
          `Please upload the following required documents:\n${missingDocs.map(d => `• ${d.label}`).join('\n')}`
        );
        return;
      }

      setIsSubmitting(true);

      // Upload all selected documents
      const uploadPromises = Object.keys(uploads)
        .filter(docType => uploads[docType].file)
        .map(docType => uploadDocument(docType));

      const results = await Promise.all(uploadPromises);
      const allSuccess = results.every(r => r === true);

      setIsSubmitting(false);

      if (allSuccess) {
        // Update KYC status to pending review
        await SupabaseService.updateKYCVerification(userId, {
          status: 'pending',
          submitted_at: new Date().toISOString(),
        });

        Alert.alert(
          'Documents Submitted',
          'Your documents have been uploaded successfully. We will review them within 1-2 business days.',
          [
            {
              text: 'OK',
              onPress: () => onComplete?.(),
            },
          ]
        );
      } else {
        Alert.alert(
          'Upload Failed',
          'Some documents failed to upload. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error submitting documents:', error);
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to submit documents. Please try again.');
    }
  };

  const hasAllRequiredDocs = DOCUMENT_TYPES.filter(d => d.required).every(
    d => uploads[d.id].file
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Documents</Text>
        {onCancel && (
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Document Requirements</Text>
          <Text style={styles.instructionsText}>
            • Documents must be clear and readable
          </Text>
          <Text style={styles.instructionsText}>
            • Maximum file size: 5 MB per document
          </Text>
          <Text style={styles.instructionsText}>
            • Accepted formats: JPG, PNG, WebP, PDF
          </Text>
          <Text style={styles.instructionsText}>
            • All photos will be automatically compressed if needed
          </Text>
        </View>

        {/* Document Upload Sections */}
        {DOCUMENT_TYPES.map(docType => {
          const upload = uploads[docType.id];
          const hasFile = upload.file !== null;

          return (
            <View key={docType.id} style={styles.documentSection}>
              <View style={styles.documentHeader}>
                <Text style={styles.documentTitle}>
                  {docType.label}
                  {docType.required && <Text style={styles.required}> *</Text>}
                </Text>
                {upload.status === 'success' && (
                  <CheckCircle2 size={20} color="#10B981" />
                )}
              </View>

              {!hasFile && upload.status !== 'uploading' && (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => handleSelectDocument(docType.id)}
                >
                  <Upload size={24} color="#8A784E" />
                  <Text style={styles.uploadButtonText}>Select {docType.label}</Text>
                </TouchableOpacity>
              )}

              {hasFile && upload.status === 'idle' && upload.file && (
                <DocumentPreview
                  uri={upload.file.uri}
                  fileName={upload.file.name}
                  fileSize={upload.file.size}
                  fileType={upload.file.type}
                  onRemove={() => handleRemoveDocument(docType.id)}
                />
              )}

              {(upload.status === 'uploading' || upload.status === 'success' || upload.status === 'error') && upload.file && (
                <UploadProgress
                  progress={upload.progress}
                  fileName={upload.file.name}
                  status={upload.status}
                  error={upload.error}
                />
              )}
            </View>
          );
        })}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!hasAllRequiredDocs || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!hasAllRequiredDocs || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Documents</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#8A784E',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  documentSection: {
    marginBottom: 24,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  required: {
    color: '#EF4444',
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8A784E',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#8A784E',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
