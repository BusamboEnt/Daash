import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, Clock, Check } from 'lucide-react-native';

interface AutoLockTimeoutModalProps {
  visible: boolean;
  onClose: () => void;
  currentTimeout: number; // in minutes
  onSelect: (timeout: number) => void;
}

const timeoutOptions = [
  { value: 1, label: '1 minute' },
  { value: 2, label: '2 minutes' },
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
];

const AutoLockTimeoutModal: React.FC<AutoLockTimeoutModalProps> = ({
  visible,
  onClose,
  currentTimeout,
  onSelect,
}) => {
  const [selectedTimeout, setSelectedTimeout] = useState(currentTimeout);

  const handleSelect = (timeout: number) => {
    setSelectedTimeout(timeout);
  };

  const handleConfirm = () => {
    onSelect(selectedTimeout);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Clock size={24} color="#8A784E" />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.title}>Auto-Lock Timeout</Text>
          <Text style={styles.description}>
            Choose how long the app should wait before locking automatically
          </Text>

          {/* Options */}
          <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
            {timeoutOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  selectedTimeout === option.value && styles.optionButtonActive,
                ]}
                onPress={() => handleSelect(option.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedTimeout === option.value && styles.optionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedTimeout === option.value && (
                  <Check size={20} color="#8A784E" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  optionsContainer: {
    maxHeight: 300,
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
  },
  optionButtonActive: {
    backgroundColor: '#FFF3E0',
    borderWidth: 2,
    borderColor: '#8A784E',
  },
  optionText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#8A784E',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#8A784E',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AutoLockTimeoutModal;
