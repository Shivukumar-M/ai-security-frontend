// frontend/src/pages/Profile.jsx
import React, { useEffect, useState, useRef } from "react";

/* ============================
   CONTEXT & API
============================ */
import { useAuth } from "../context/AuthContext.jsx";
import {
  getMyProfile,
  getProfileSecuritySummary,
  updateMyProfile,
  uploadAvatar,
  changeMyPassword,
} from "../api/profile.js";

/* ============================
   ICONS
============================ */
import {
  Shield,
  Fingerprint,
  Globe,
  Activity,
  ShieldCheck,
  MapPin,
  AlertCircle,
  Camera,
  Edit3,
  Save,
  X,
  Lock,
  User,
  Mail,
  Briefcase,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

/* =========================================================
   STABLE / MEMOIZED UI COMPONENTS
========================================================= */

const StableRow = React.memo(
  ({
    icon: Icon,
    label,
    value,
    onChange,
    editable,
    type = "text",
    options = [],
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-2 min-w-[140px]">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
        <span className="text-gray-400 font-medium">{label}:</span>
      </div>

      {type === "select" ? (
        <select
          value={value}
          disabled={!editable}
          onChange={(e) => onChange(e.target.value)}
          className={`bg-[#0a111f] border border-gray-700 rounded-lg px-4 py-2 text-white w-full transition
            ${editable ? "border-cyan-500/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" : "opacity-60 cursor-not-allowed"}`}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={value}
          readOnly={!editable}
          onChange={(e) => onChange(e.target.value)}
          className={`bg-[#0a111f] border border-gray-700 rounded-lg px-4 py-2 text-white w-full transition
            ${editable ? "border-cyan-500/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" : "opacity-60 cursor-not-allowed"}`}
        />
      )}
    </div>
  )
);

/* =========================================================
   MAIN PROFILE PAGE
========================================================= */

const Profile = () => {
  /* ---------- AUTH ---------- */
  const { updateUser } = useAuth();

  /* ---------- STATE ---------- */
  const [security, setSecurity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [editing, setEditing] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [exposure, setExposure] = useState("Moderate");

  const [avatar, setAvatar] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const fileRef = useRef(null);

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  /* ---------- EFFECTS ---------- */
  // Load profile data on mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        const profileData = await getMyProfile();
        
        setDisplayName(profileData.full_name || "");
        setEmail(profileData.email || "");
        setRole(profileData.role || "SOC Analyst (Tier-1)");
        setLocation(profileData.location || "");
        setExposure(profileData.threat_exposure || "Moderate");
        setAvatarUrl(profileData.avatar_url || "");
        setAvatar(null);
        setAvatarFile(null);

        // Load security summary
        const securityData = await getProfileSecuritySummary();
        setSecurity(securityData);
      } catch (err) {
        console.error("Failed to load profile:", err);
        showMessage("Failed to load profile data", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  /* ---------- HANDLERS ---------- */
  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const validatePasswords = () => {
    if (passwords.newPass && passwords.newPass !== passwords.confirm) {
      showMessage("New passwords do not match!", "error");
      return false;
    }
    if (passwords.newPass && passwords.newPass.length < 8) {
      showMessage("New password must be at least 8 characters", "error");
      return false;
    }
    if (passwords.newPass && !passwords.current) {
      showMessage("Current password is required to set new password", "error");
      return false;
    }
    return true;
  };

  const handleSaveProfile = async () => {
    if (!validatePasswords()) return;

    try {
      setSaving(true);

      // Update profile (without email)
      await updateMyProfile({
        full_name: displayName,
        role,
        location,
        threat_exposure: exposure,
      });

      if (avatarFile) {
        const avatarRes = await uploadAvatar(avatarFile);
        setAvatarUrl(avatarRes.avatar_url || "");
      }

      // Change password if provided
      if (passwords.newPass) {
        await changeMyPassword({
          current_password: passwords.current,
          new_password: passwords.newPass,
        });
      }

      showMessage("✓ Profile updated successfully!", "success");
      setEditing(false);
      setPasswords({ current: "", newPass: "", confirm: "" });

      // Reload profile data to ensure it's in sync
      const updatedProfile = await getMyProfile();
      setDisplayName(updatedProfile.full_name || "");
      setRole(updatedProfile.role || "");
      setLocation(updatedProfile.location || "");
      setExposure(updatedProfile.threat_exposure || "");
      setAvatarUrl(updatedProfile.avatar_url || "");
      setAvatar(null);
      setAvatarFile(null);

      updateUser?.({
        full_name: updatedProfile.full_name,
        role: updatedProfile.role,
        location: updatedProfile.location,
        threat_exposure: updatedProfile.threat_exposure,
        avatar_url: updatedProfile.avatar_url,
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        "Failed to update profile";
      showMessage(`✗ ${errorMsg}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setPasswords({ current: "", newPass: "", confirm: "" });
    // Reset to loaded values
    const resetProfile = async () => {
      try {
        const profileData = await getMyProfile();
        setDisplayName(profileData.full_name || "");
        setRole(profileData.role || "");
        setLocation(profileData.location || "");
        setExposure(profileData.threat_exposure || "");
        setAvatarUrl(profileData.avatar_url || "");
        setAvatar(null);
        setAvatarFile(null);
      } catch (err) {
        console.error("Failed to reset profile:", err);
      }
    };
    resetProfile();
  };

  /* =========================================================
     RENDER
  ========================================================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <Shield className="w-12 h-12 text-cyan-400" />
          </div>
          <p className="mt-4 text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-10 pb-24 px-3 sm:px-6">

      {/* ================= MESSAGE ALERT ================= */}
      {message && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg flex items-center gap-2 z-50 ${
            messageType === "success"
              ? "bg-green-900/20 border border-green-500/50 text-green-400"
              : "bg-red-900/20 border border-red-500/50 text-red-400"
          }`}
        >
          {messageType === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertTriangle size={20} />
          )}
          {message}
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white flex gap-2 sm:gap-3 items-center">
            <Shield className="text-cyan-400" size={32} />
            Security Analyst Profile
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-2">
            Manage your account settings, security, and threat intelligence
          </p>
        </div>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition"
          >
            <Edit3 size={18} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition disabled:opacity-50"
            >
              <Save size={18} /> {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              <X size={18} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* ================= USER PROFILE CARD ================= */}
      <div className="bg-[#09101b]/70 border border-cyan-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
        <div className="space-y-8">

          {/* IDENTITY SECTION */}
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex flex-col sm:flex-row gap-6 w-full">
              {/* AVATAR */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500 to-blue-900 p-[3px]">
                  <div className="w-full h-full bg-[#0d1626] rounded-full flex items-center justify-center overflow-hidden">
                    {avatar || avatarUrl ? (
                      <img
                        src={avatar || avatarUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Fingerprint className="w-14 h-14 text-cyan-400" />
                    )}
                  </div>
                </div>

                {editing && (
                  <>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute -bottom-2 -right-2 bg-cyan-500 hover:bg-cyan-600 text-black p-2.5 rounded-full shadow-lg transition"
                      title="Change avatar"
                    >
                      <Camera size={16} />
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </>
                )}
              </div>

              {/* PROFILE INFO */}
              <div className="space-y-4 w-full">
                <StableRow
                  icon={User}
                  label="Full Name"
                  value={displayName}
                  onChange={setDisplayName}
                  editable={editing}
                />

                <StableRow
                  icon={Mail}
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  editable={false}
                />

                <StableRow
                  icon={Briefcase}
                  label="Role"
                  value={role}
                  onChange={setRole}
                  editable={editing}
                />

                <StableRow
                  icon={MapPin}
                  label="Location"
                  value={location}
                  onChange={setLocation}
                  editable={editing}
                />

                <StableRow
                  icon={AlertCircle}
                  label="Threat Exposure"
                  value={exposure}
                  onChange={setExposure}
                  editable={editing}
                  type="select"
                  options={["Low", "Moderate", "High"]}
                />
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          {editing && <div className="border-t border-gray-700"></div>}

          {/* SECURITY SUMMARY (VIEW MODE) */}
          {!editing && security && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0a111f] border border-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  <Globe size={16} /> URLs Scanned
                </p>
                <p className="text-2xl font-bold text-cyan-400 mt-2">
                  {security.urls_scanned || 0}
                </p>
              </div>

              <div className="bg-[#0a111f] border border-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  <Activity size={16} /> Files Scanned
                </p>
                <p className="text-2xl font-bold text-cyan-400 mt-2">
                  {security.files_scanned || 0}
                </p>
              </div>

              <div className="bg-[#0a111f] border border-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  <ShieldCheck size={16} /> IDS Events
                </p>
                <p className="text-2xl font-bold text-yellow-400 mt-2">
                  {security.ids_events || 0}
                </p>
              </div>

              <div className="bg-[#0a111f] border border-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  <AlertCircle size={16} /> Total Threats
                </p>
                <p className="text-2xl font-bold text-red-400 mt-2">
                  {security.total_threats || 0}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= PASSWORD CHANGE SECTION ================= */}
      {editing && (
        <div className="bg-[#09101b]/70 border border-red-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-sm max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="text-red-400" size={24} />
            Change Password (Optional)
          </h2>

          <div className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              value={passwords.current}
              onChange={(e) =>
                setPasswords({ ...passwords, current: e.target.value })
              }
              className="w-full p-3 bg-[#0a111f] border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-400 transition"
            />
            <input
              type="password"
              placeholder="New Password (min. 8 characters)"
              value={passwords.newPass}
              onChange={(e) =>
                setPasswords({ ...passwords, newPass: e.target.value })
              }
              className="w-full p-3 bg-[#0a111f] border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-400 transition"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
              className="w-full p-3 bg-[#0a111f] border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-400 transition"
            />

            <p className="text-gray-500 text-sm">
              💡 Leave blank if you don't want to change your password
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
