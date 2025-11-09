import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { CheckCircle, XCircle, Upload } from 'lucide-react-native';

interface UploadProgressProps {
  progress: number; // 0-100
  fileName: string;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  fileName,
  status,
  error,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle size={24} color="#10B981" />;
      case 'error':
        return <XCircle size={24} color="#EF4444" />;
      default:
        return <Upload size={24} color="#8A784E" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      default:
        return '#8A784E';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>{getStatusIcon()}</View>
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {fileName}
          </Text>
          {status === 'uploading' && (
            <Text style={styles.progressText}>{progress}% uploaded</Text>
          )}
          {status === 'success' && (
            <Text style={styles.successText}>Upload complete</Text>
          )}
          {status === 'error' && (
            <Text style={styles.errorText}>{error || 'Upload failed'}</Text>
          )}
        </View>
        {status === 'uploading' && (
          <ActivityIndicator size="small" color="#8A784E" />
        )}
      </View>

      {/* Progress Bar */}
      {status === 'uploading' && (
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${progress}%`, backgroundColor: getStatusColor() },
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  successText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});
