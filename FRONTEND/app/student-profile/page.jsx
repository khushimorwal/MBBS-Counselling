"use client";

import { useState } from "react";

import ProfileSidebar from "./components/ProfileSidebar";
import ProfileInfo from "./components/ProfileInfo";
import ProfileTabs from "./components/ProfileTabs";

import MyApplications from "./sections/MyApplications";
import MyDocuments from "./sections/MyDocuments";
import Notification from "./sections/Notification";
import Setting from "./sections/Setting";
import CounsellingStatus from "./sections/CounsellingStatus";

export default function StudentProfile() {
  const [activeSection, setActiveSection] = useState("profile");
  const [activeTab, setActiveTab] = useState("personal");
  const [profileData, setProfileData] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-[1600px]">

        {/* Sidebar */}
        <ProfileSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        {/* Main Content */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">

          {/* MY PROFILE */}
          {activeSection === "profile" && (
            <div className="space-y-6">
              <ProfileInfo onProfileUpdate={setProfileData} />

              <ProfileTabs
                profile={profileData}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
          )}

          {/* MY APPLICATIONS */}
          {activeSection === "applications" && (
            <MyApplications />
          )}

          {/* MY DOCUMENTS */}
          {activeSection === "documents" && (
            <MyDocuments />
          )}

          {/* COUNSELLING STATUS */}
{activeSection === "counselling" && (
  <CounsellingStatus />
)}

          {/* NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <Notification />
          )}

          {/* SETTINGS */}
          {activeSection === "settings" && (
            <Setting />
          )}

          

        </main>
      </div>
    </div>
  );
}