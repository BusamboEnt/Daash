import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, Globe, Check } from 'lucide-react-native';

interface LanguageSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  currentLanguage: string;
  onSelect: (language: string) => void;
}

const languageOptions = [
  { value: 'English', label: 'English', nativeName: 'English' },
  { value: 'Spanish', label: 'Spanish', nativeName: 'Español' },
  { value: 'French', label: 'French', nativeName: 'Français' },
  { value: 'German', label: 'German', nativeName: 'Deutsch' },
  { value: 'Italian', label: 'Italian', nativeName: 'Italiano' },
  { value: 'Portuguese', label: 'Portuguese', nativeName: 'Português' },
  { value: 'Dutch', label: 'Dutch', nativeName: 'Nederlands' },
  { value: 'Russian', label: 'Russian', nativeName: 'Русский' },
  { value: 'Chinese', label: 'Chinese', nativeName: '中文' },
  { value: 'Japanese', label: 'Japanese', nativeName: '日本語' },
  { value: 'Korean', label: 'Korean', nativeName: '한국어' },
  { value: 'Arabic', label: 'Arabic', nativeName: 'العربية' },
];

const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  visible,
  onClose,
  currentLanguage,
  onSelect,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleSelect = (language: string) => {
    setSelectedLanguage(language);
  };

  const handleConfirm = () => {
    onSelect(selectedLanguage);
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
              <Globe size={24} color="#8A784E" />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.title}>Language</Text>
          <Text style={styles.description}>
            Select your preferred language
          </Text>

          {/* Options */}
          <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
            {languageOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  selectedLanguage === option.value && styles.optionButtonActive,
                ]}
                onPress={() => handleSelect(option.value)}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <Text
                    style={[
                      styles.optionText,
                      selectedLanguage === option.value && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.nativeText}>{option.nativeName}</Text>
                </View>
                {selectedLanguage === option.value && (
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
    maxHeight: 400,
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
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
  optionLeft: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    marginBottom: 2,
  },
  optionTextActive: {
    color: '#8A784E',
    fontWeight: '600',
  },
  nativeText: {
    fontSize: 14,
    color: '#8E8E93',
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

export default LanguageSelectorModal;
