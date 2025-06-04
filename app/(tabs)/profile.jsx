/*
  ProfileScreen.jsx
  This file is the Profile Screen component.
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
import EditProfileModal from "../../components/EditProfileModal";
import { useSelector } from "react-redux";

export default function ProfileScreen() {
  const router = useRouter();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const {user} = useSelector((state) => state.auth);
  const [userProfile, setUserProfile] = useState({
    name: user?.username || "John Doe",
    email: user?.email || "F2M5H@example.com",
    phone: user?.phone || "+1 234 567 8900",
    level: user?.level || "Beginner",
    joinDate: user?.createdTS || "January 2024",
    wordsLearned: 245,
    streak: 15,
    isPremium: user?.premium || false,
  });

  const handleSaveProfile = (updatedProfile) => {
    setUserProfile(updatedProfile);
    setEditModalVisible(false);
    Alert.alert("Success", "Profile updated successfully!");
  };

  const handleUpgradePremium = () => {
    Alert.alert(
      "Premium Upgrade",
      "Upgrade to Premium for unlimited access to all features!",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Upgrade", onPress: () => console.log("Navigate to premium") },
      ]
    );
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
      <Ionicons name="chevron-forward" size={20} color="#666" />
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
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userEmail}>{userProfile.email}</Text>
          
          {/* Premium Status */}
          <View style={[styles.premiumBadge, userProfile.isPremium ? styles.premiumActive : styles.premiumInactive]}>
            <Ionicons 
              name={userProfile.isPremium ? "diamond" : "diamond-outline"} 
              size={16} 
              color={userProfile.isPremium ? "#FFD700" : "#666"} 
            />
            <Text style={[styles.premiumText, userProfile.isPremium ? styles.premiumTextActive : styles.premiumTextInactive]}>
              {userProfile.isPremium ? "Premium Member" : "Free Member"}
            </Text>
          </View>

          {!userProfile.isPremium && (
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
              value={userProfile.wordsLearned}
              color="#06B6D4"
            />
            <StatCard
              icon="flame"
              label="Day Streak"
              value={userProfile.streak}
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Profile Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.profileDetails}>
            <ProfileItem
              icon="call-outline"
              label="Phone"
              value={userProfile.phone}
              onPress={() => console.log("Edit phone")}
            />
            <ProfileItem
              icon="stats-chart-outline"
              label="Level"
              value={userProfile.level}
              onPress={() => console.log("Edit location")}
            />
            <ProfileItem
              icon="calendar-outline"
              label="Member Since"
              value={userProfile.joinDate}
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