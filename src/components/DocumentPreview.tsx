import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { FileText, X, Eye } from 'lucide-react-native';
import { formatFileSize } from '../utils/fileUpload';

interface DocumentPreviewProps {
  uri: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  onRemove?: () => void;
  onView?: () => void;
  showActions?: boolean;
}

const { width } = Dimensions.get('window');
const PREVIEW_SIZE = (width - 64) / 2; // 2 columns with padding

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  uri,
  fileName,
  fileSize,
  fileType,
  onRemove,
  onView,
  showActions = true,
}) => {
  const isPDF = fileType === 'application/pdf';

  return (
    <View style={styles.container}>
      {/* Preview */}
      <View style={styles.previewContainer}>
        {isPDF ? (
          <View style={styles.pdfPreview}>
            <FileText size={48} color="#8A784E" />
            <Text style={styles.pdfLabel}>PDF</Text>
          </View>
        ) : (
          <Image source={{ uri }} style={styles.imagePreview} resizeMode="cover" />
        )}

        {/* Actions Overlay */}
        {showActions && (
          <View style={styles.actionsOverlay}>
            {onView && (
              <TouchableOpacity style={styles.actionButton} onPress={onView}>
                <Eye size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            {onRemove && (
              <TouchableOpacity
                style={[styles.actionButton, styles.removeButton]}
                onPress={onRemove}
              >
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* File Info */}
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {fileName}
        </Text>
        <Text style={styles.fileSize}>{formatFileSize(fileSize)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: PREVIEW_SIZE,
    marginBottom: 16,
  },
  previewContainer: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  pdfPreview: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
  },
  pdfLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  actionsOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  fileInfo: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#6B7280',
  },
});
