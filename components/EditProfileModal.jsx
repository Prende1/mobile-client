/*
  EditProfileModal.jsx
  This file is the Edit Profile Modal component.
*/

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EditProfileModal({ visible, userProfile, onClose, onSave }) {
  const [editedProfile, setEditedProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });

  const [errors, setErrors] = useState({});

  // Update editedProfile when userProfile changes or modal opens
  useEffect(() => {
    if (visible && userProfile) {
      setEditedProfile({
        name: userProfile.name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        location: userProfile.location || "",
      });
      setErrors({});
    }
  }, [visible, userProfile]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!editedProfile.name.trim()) {
      newErrors.name = "Name is required";
    } else if (editedProfile.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editedProfile.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(editedProfile.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Phone validation (optional but if provided, should be valid)
    if (editedProfile.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(editedProfile.phone.replace(/[\s\-\(\)]/g, ""))) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      // Merge the edited fields with the original profile
      const updatedProfile = {
        ...userProfile,
        ...editedProfile,
      };
      onSave(updatedProfile);
    } else {
      Alert.alert("Validation Error", "Please fix the errors before saving.");
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    keyboardType = "default",
    icon,
    error 
  }) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputLabelContainer}>
        <Ionicons name={icon} size={20} color="#06B6D4" />
        <Text style={styles.inputLabel}>{label}</Text>
      </View>
      <TextInput
        style={[styles.modalInput, error && styles.inputError]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </Pressable>
          </View>

          <ScrollView 
            style={styles.modalBody} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <InputField
              label="Full Name"
              value={editedProfile.name}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, name: text })}
              placeholder="Enter your full name"
              icon="person-outline"
              error={errors.name}
            />

            <InputField
              label="Email Address"
              value={editedProfile.email}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, email: text })}
              placeholder="Enter your email"
              keyboardType="email-address"
              icon="mail-outline"
              error={errors.email}
            />

            <InputField
              label="Phone Number"
              value={editedProfile.phone}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, phone: text })}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              icon="call-outline"
              error={errors.phone}
            />

            <InputField
              label="Location"
              value={editedProfile.location}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, location: text })}
              placeholder="Enter your location"
              icon="location-outline"
              error={errors.location}
            />
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalButtons}>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.modalButton,
                styles.cancelButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.modalButton,
                styles.saveButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#F8FAFC",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: 400,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F8FAFC",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#F8FAFC",
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginLeft: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cancelButton: {
    backgroundColor: "#E2E8F0",
  },
  saveButton: {
    backgroundColor: "#06B6D4",
  },
  pressedButton: {
    opacity: 0.8,
  },
  cancelButtonText: {
    color: "#1E293B",
    fontWeight: "600",
    fontSize: 16,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});