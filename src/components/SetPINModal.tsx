import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { X, Lock } from 'lucide-react-native';

interface SetPINModalProps {
  visible: boolean;
  onClose: () => void;
  onPINSet: (pin: string) => void;
  mode: 'set' | 'change';
  currentPIN?: string;
}

const SetPINModal: React.FC<SetPINModalProps> = ({
  visible,
  onClose,
  onPINSet,
  mode,
  currentPIN,
}) => {
  const [step, setStep] = useState<'current' | 'new' | 'confirm'>('new');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPinInput, setCurrentPinInput] = useState('');
  const pinInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      // Reset state when modal opens
      if (mode === 'change' && currentPIN) {
        setStep('current');
      } else {
        setStep('new');
      }
      setPin('');
      setConfirmPin('');
      setCurrentPinInput('');

      // Focus input after a short delay
      setTimeout(() => {
        pinInputRef.current?.focus();
      }, 300);
    }
  }, [visible, mode, currentPIN]);

  const handleCurrentPinSubmit = () => {
    if (currentPinInput === currentPIN) {
      setStep('new');
      setCurrentPinInput('');
    } else {
      Alert.alert('Error', 'Incorrect PIN. Please try again.');
      setCurrentPinInput('');
    }
  };

  const handleNewPinSubmit = () => {
    if (pin.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits.');
      return;
    }
    setStep('confirm');
    setConfirmPin('');
  };

  const handleConfirmPinSubmit = () => {
    if (pin === confirmPin) {
      onPINSet(pin);
      onClose();
      Alert.alert('Success', 'PIN has been set successfully.');
    } else {
      Alert.alert('Error', 'PINs do not match. Please try again.');
      setConfirmPin('');
      setStep('new');
      setPin('');
    }
  };

  const getCurrentInput = () => {
    if (step === 'current') return currentPinInput;
    if (step === 'new') return pin;
    return confirmPin;
  };

  const getCurrentMaxLength = () => {
    return 6; // Allow up to 6 digits
  };

  const handleInputChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');

    if (step === 'current') {
      setCurrentPinInput(numericValue);
    } else if (step === 'new') {
      setPin(numericValue);
    } else {
      setConfirmPin(numericValue);
    }
  };

  const handleSubmit = () => {
    if (step === 'current') {
      handleCurrentPinSubmit();
    } else if (step === 'new') {
      handleNewPinSubmit();
    } else {
      handleConfirmPinSubmit();
    }
  };

  const getTitle = () => {
    if (step === 'current') return 'Enter Current PIN';
    if (step === 'new') return mode === 'change' ? 'Enter New PIN' : 'Set PIN';
    return 'Confirm PIN';
  };

  const getDescription = () => {
    if (step === 'current') return 'Enter your current PIN to continue';
    if (step === 'new') return 'Enter a 4-6 digit PIN';
    return 'Re-enter your PIN to confirm';
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
              <Lock size={24} color="#8A784E" />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.description}>{getDescription()}</Text>

          {/* PIN Input */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={pinInputRef}
              style={styles.hiddenInput}
              value={getCurrentInput()}
              onChangeText={handleInputChange}
              keyboardType="number-pad"
              maxLength={getCurrentMaxLength()}
              secureTextEntry={false}
              autoFocus={true}
            />
            <View style={styles.dotContainer}>
              {[...Array(6)].map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index < getCurrentInput().length && styles.dotFilled,
                  ]}
                />
              ))}
            </View>
          </View>

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
              style={[
                styles.submitButton,
                getCurrentInput().length < 4 && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={getCurrentInput().length < 4}
            >
              <Text style={styles.submitButtonText}>
                {step === 'confirm' ? 'Confirm' : 'Continue'}
              </Text>
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
    minHeight: 400,
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
    marginBottom: 32,
  },
  inputContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  dotContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  dotFilled: {
    backgroundColor: '#8A784E',
    borderColor: '#8A784E',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
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
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#8A784E',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SetPINModal;
