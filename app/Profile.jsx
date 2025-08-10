/*
  ProfileScreen.jsx
  This file is the Profile Screen component with separate useState for each field and image handling.
*/

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import EditProfileModal from "../components/EditProfileModal";
import { useDispatch, useSelector } from "react-redux";
import API_ROUTES from "../api/apiConfig";
import { loginSuccess } from "../redux/login/authSlice";

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  console.log("User in ProfileScreen:", token);
  
  // Separate useState for each field
  const [username, setUsername] = useState(user?.username || "John Doe");
  const [email, setEmail] = useState(user?.email || "F2M5H@example.com");
  const [phone, setPhone] = useState(user?.phone || "+1 234 567 8900");
  const [level, setLevel] = useState(user?.level || "Beginner");
  const [createdTS, setCreatedTS] = useState(user?.createdTS || "January 2024");
  const [wordsLearned, setWordsLearned] = useState(245);
  const [streak, setStreak] = useState(15);
  const [premium, setPremium] = useState(user?.premium || false);
  const [profileImage, setProfileImage] = useState(user?.image || null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Create userProfile object for 
  const userProfile = {
    username,
    email,
    phone,
    level,
    createdTS,
    wordsLearned,
    streak,
    premium,
    image: profileImage,
  };

  // Function to get initials from username
  const getInitials = (name) => {
    if (!name) return "JD";
    const names = name.trim().split(' ');
    return names.length === 1 ? names[0].substring(0, 2).toUpperCase() : (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const handleImageSelection = async () => {
    Alert.alert("Update Profile Picture", "Choose an option", [
      { text: "Camera", onPress: () => openCamera() },
      { text: "Gallery", onPress: () => openGallery() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Camera permission is required to take photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) uploadProfileImage(result.assets[0]);
  };

  const openGallery = async () => {
    console.log("h01n1");
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Gallery permission is required to select photos.");
      return;
    }
    console.log("h01n1");
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) uploadProfileImage(result.assets[0]);
  };
  const uploadProfileImage = async (imageAsset) => {
    console.log("h01n");
  try {
    
    setIsImageUploading(true);
    const formData = new FormData();
    
    // Create proper file object for FormData
    formData.append('image', {
      uri: imageAsset.uri,
      type:'image/jpeg',
      name: imageAsset.fileName || 'profile.jpg'
    });
    console.log("khbdjbh")
    const response = await fetch(API_ROUTES.updateUser(user._id), {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        // DON'T set Content-Type header - let browser set it automatically for FormData
        // "Content-Type": "multipart/form-data", // ❌ Remove this line
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (response.ok) {
      dispatch(loginSuccess(data.user));
      setProfileImage(data.user.image);
      Alert.alert("Success", "Profile picture updated successfully!");
    } else {
      throw new Error(data.message || "Failed to update profile picture");
    }
  } catch (error) {
    console.error("Error uploading profile image:", error);
    Alert.alert("Upload Failed", "Failed to update profile picture. Please try again.");
  } finally {
    setIsImageUploading(false);
  }
};

  const handleSaveProfile = async (updatedProfile) => {
    try {
      const userData = { username: updatedProfile.username, email: updatedProfile.email, phone: updatedProfile.phone, level: updatedProfile.level };
      const res = await fetch(API_ROUTES.updateUser(user._id), {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(loginSuccess(data.user));
        setUsername(data.user.username || updatedProfile.username);
        setEmail(data.user.email || updatedProfile.email);
        setPhone(data.user.phone || updatedProfile.phone);
        setLevel(data.user.level || updatedProfile.level);
        if (data.user.createdTS) setCreatedTS(data.user.createdTS);
        if (data.user.wordsLearned) setWordsLearned(data.user.wordsLearned);
        if (data.user.streak) setStreak(data.user.streak);
        if (data.user.premium !== undefined) setPremium(data.user.premium);
        if (data.user.image) setProfileImage(data.user.image);
        setEditModalVisible(false);
        Alert.alert("Profile Updated", "Your profile has been successfully updated.");
      } else throw new Error(data.message || "Failed to update profile");
    } catch (error) {
      console.error("Error updating user profile:", error);
      Alert.alert("Update Failed", "Failed to update profile. Please try again.");
    }
  };

  const handleUpgradePremium = () => {
    Alert.alert("Premium Upgrade", "Upgrade to Premium for unlimited access to all features!", [
      { text: "Cancel", style: "cancel" },
      { text: "Upgrade", onPress: () => console.log("Navigate to premium") },
    ]);
  };


  const ProfileItem = ({ icon, label, value, onPress }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemLeft}>
        <Ionicons name={icon} size={24} color="#06B6D4" />
        <View style={styles.profileItemText}>
          <Text style={styles.profileLabel}>{label}</Text>
          <Text style={styles.profileValue}>{value}</Text>
        </View>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={20} color="#666" />}
    </TouchableOpacity>
  );

  const StatCard = ({ icon, label, value, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={28} color={color} />
      <View style={styles.statText}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditModalVisible(true)}
        >
          <Ionicons name="create-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Image and Basic Info */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{getInitials(username)}</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.cameraButton} 
              onPress={handleImageSelection}
              disabled={isImageUploading}
            >
              {isImageUploading ? (
                <Ionicons name="hourglass" size={16} color="white" />
              ) : (
                <Ionicons name="camera" size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{username}</Text>
          <Text style={styles.userEmail}>{email}</Text>
          
          {/* Premium Status */}
          <View style={[styles.premiumBadge, premium ? styles.premiumActive : styles.premiumInactive]}>
            <Ionicons 
              name={premium ? "diamond" : "diamond-outline"} 
              size={16} 
              color={premium ? "#FFD700" : "#666"} 
            />
            <Text style={[styles.premiumText, premium ? styles.premiumTextActive : styles.premiumTextInactive]}>
              {premium ? "Premium Member" : "Free Member"}
            </Text>
          </View>

          {!premium && (
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradePremium}>
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsContainer}>
            <StatCard
              icon="library-outline"
              label="Words Learned"
              value={wordsLearned}
              color="#06B6D4"
            />
            <StatCard
              icon="flame"
              label="Day Streak"
              value={streak}
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Profile Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.profileDetails}>
            <ProfileItem
              icon="person-outline"
              label="Username"
              value={username}
            />
            <ProfileItem
              icon="mail-outline"
              label="Email"
              value={email}
            />
            <ProfileItem
              icon="call-outline"
              label="Phone"
              value={phone || "Not provided"}
            />
            <ProfileItem
              icon="stats-chart-outline"
              label="Level"
              value={level}
            />
            <ProfileItem
              icon="calendar-outline"
              label="Member Since"
              value={createdTS}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="settings-outline" size={24} color="#06B6D4" />
              <Text style={styles.actionButtonText}>Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="help-circle-outline" size={24} color="#06B6D4" />
              <Text style={styles.actionButtonText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              <Text style={[styles.actionButtonText, { color: "#EF4444" }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editModalVisible}
        userProfile={userProfile}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveProfile}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E293B",
  },
  header: {
    backgroundColor: "#06B6D4",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  editButton: {
    padding: 5,
  },
  scrollContainer: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#06B6D4",
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#06B6D4",
    backgroundColor: "#475569",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#06B6D4",
    textAlign: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#06B6D4",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1E293B",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#94A3B8",
    marginBottom: 16,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  premiumActive: {
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  premiumInactive: {
    backgroundColor: "rgba(156, 163, 175, 0.1)",
    borderWidth: 1,
    borderColor: "#666",
  },
  premiumText: {
    marginLeft: 8,
    fontWeight: "600",
  },
  premiumTextActive: {
    color: "#FFD700",
  },
  premiumTextInactive: {
    color: "#666",
  },
  upgradeButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  upgradeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    flex: 0.48,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
  },
  statText: {
    marginLeft: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  detailsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  profileDetails: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  profileItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileItemText: {
    marginLeft: 12,
    flex: 1,
  },
  profileLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  profileValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  actionButtons: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  actionButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginLeft: 12,
    flex: 1,
  },
});