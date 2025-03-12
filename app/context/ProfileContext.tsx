import React, { createContext, useState, useContext } from "react";
import config from "@/config";

// Define context type
type ProfileContextType = {
  activeProfile: keyof typeof config.PROFILES;
  userId: string;
  setActiveProfile: (profile: keyof typeof config.PROFILES) => void;
};

// Create context
export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Provider component
export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProfile, setActiveProfile] = useState<keyof typeof config.PROFILES>("user1");

  return (
    <ProfileContext.Provider
      value={{
        activeProfile,
        userId: config.PROFILES[activeProfile].USER_ID, // Automatically updates when profile changes
        setActiveProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

// Custom hook for using ProfileContext
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

export default ProfileProvider;