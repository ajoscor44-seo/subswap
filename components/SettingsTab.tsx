import React, { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@/constants/types";
import { useAuth } from "@/providers/auth";

// ─── Cloudinary upload hook ────────────────────────────────────────────────────

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_AVATAR_UPLOAD_PRESET!;

export const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File): Promise<string> => {
    if (!CLOUD_NAME)
      throw new Error("Cloudinary cloud name is not configured.");
    if (!UPLOAD_PRESET)
      throw new Error("Cloudinary upload preset is not configured.");

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable)
          setProgress(Math.round((e.loaded / e.total) * 100));
      };

      xhr.onload = () => {
        setUploading(false);
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.secure_url) resolve(data.secure_url);
            else
              reject(
                new Error(
                  data.error?.message || "Upload failed — no URL returned.",
                ),
              );
          } catch {
            reject(new Error("Unexpected response from Cloudinary."));
          }
        } else {
          let msg = `Upload failed (status ${xhr.status}).`;
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.error?.message) msg = data.error.message;
          } catch {}
          reject(new Error(msg));
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        reject(
          new Error("Network error — check your connection and try again."),
        );
      };

      xhr.ontimeout = () => {
        setUploading(false);
        reject(new Error("Upload timed out. Please try again."));
      };

      xhr.timeout = 30000;
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      );
      xhr.send(formData);
    });
  };

  return { upload, uploading, progress };
};

// ─── Avatar uploader component ─────────────────────────────────────────────────

interface AvatarUploaderProps {
  currentAvatar: string;
  username: string;
  onUploaded: (url: string) => void;
  showStatus: (text: string, type: "success" | "error") => void;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatar,
  username,
  onUploaded,
  showStatus,
}) => {
  const { upload, uploading, progress } = useCloudinaryUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showStatus("Please select an image file (PNG, JPG, WEBP).", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showStatus("Image must be under 5MB.", "error");
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const url = await upload(file);
      onUploaded(url);
    } catch (err: any) {
      setPreview(null);
      showStatus(err.message || "Upload failed. Try again.", "error");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const displaySrc = preview || currentAvatar;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      {/* Avatar preview */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            overflow: "hidden",
            border: "3px solid #ede9fe",
            boxShadow: "0 4px 16px rgba(124,92,252,0.2)",
          }}
        >
          <img
            src={displaySrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            alt={username}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=7c5cfc&color=fff&size=80`;
            }}
          />
        </div>

        {/* Upload progress overlay */}
        {uploading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "rgba(26,18,48,0.7)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <i
              className="fa-solid fa-spinner fa-spin"
              style={{ color: "#fff", fontSize: 16 }}
            />
            <span
              style={{
                color: "#fff",
                fontSize: 9,
                fontFamily: "'Outfit',sans-serif",
                fontWeight: 700,
              }}
            >
              {progress}%
            </span>
          </div>
        )}

        {/* Camera button */}
        {!uploading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c5cfc, #6366f1)",
              border: "2.5px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(124,92,252,0.4)",
              transition: "transform 0.15s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.1)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <i
              className="fa-solid fa-camera"
              style={{ color: "#fff", fontSize: 10 }}
            />
          </button>
        )}
      </div>

      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        style={{
          flex: 1,
          padding: "18px 20px",
          borderRadius: 14,
          textAlign: "center",
          border: `1.5px dashed ${isDragging ? "#7c5cfc" : "#ede9fe"}`,
          background: isDragging ? "#f5f3ff" : "#fafafe",
          cursor: uploading ? "default" : "pointer",
          transition: "all 0.2s",
        }}
      >
        {uploading ? (
          <div>
            <div
              style={{
                height: 5,
                background: "#f0eef9",
                borderRadius: 99,
                overflow: "hidden",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 99,
                  background: "linear-gradient(90deg, #7c5cfc, #a78bfa)",
                  width: `${progress}%`,
                  transition: "width 0.2s",
                }}
              />
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontFamily: "'Outfit',sans-serif",
                fontWeight: 700,
                color: "#7c5cfc",
              }}
            >
              Uploading… {progress}%
            </p>
          </div>
        ) : (
          <>
            <i
              className="fa-solid fa-cloud-arrow-up"
              style={{
                color: "#c4b5fd",
                fontSize: 20,
                display: "block",
                marginBottom: 6,
              }}
            />
            <p
              style={{
                margin: "0 0 3px",
                fontSize: 13,
                fontWeight: 500,
                color: "#475569",
              }}
            >
              Drop image here or{" "}
              <span style={{ color: "#7c5cfc", fontWeight: 600 }}>browse</span>
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "#b8addb" }}>
              PNG, JPG, WEBP · max 5 MB
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
};

interface SettingsTabProps {
  user: User;
  showStatus: (text: string, type: "success" | "error") => void;
  logout: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  user,
  showStatus,
  logout,
}) => {
  const { refreshProfile } = useAuth();
  const [name, setName] = useState(user.name || "");
  const [username, setUsername] = useState(user.username || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [avatarUrl, setAvatarUrl] = useState(
    user.avatar ||
      `https://ui-avatars.com/api/?name=${user.username}&background=ede9fe&color=7c5cfc&size=36`,
  );
  const [saving, setSaving] = useState(false);

  const handleAvatarUploaded = async (url: string) => {
    setAvatarUrl(url);
    const { error } = await supabase
      .from("profiles")
      .update({ avatar: url })
      .eq("id", user.id);

    if (error) showStatus("Failed to update avatar.", "error");
    else {
      showStatus("Profile photo updated!", "success");
      await refreshProfile();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showStatus("Display name cannot be empty.", "error");
      return;
    }
    if (!username.trim()) {
      showStatus("Username cannot be empty.", "error");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: name.trim(),
          username: username.trim(),
          avatar: avatarUrl,
          phone_number: phoneNumber.trim(),
        })
        .eq("id", user.id);
      if (error) throw error;
      showStatus("Profile updated successfully!", "success");
      await refreshProfile();
    } catch (err: any) {
      showStatus(err.message || "Failed to save changes.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        .st-root { font-family: 'DM Sans', sans-serif; color: #1a1230; }
        .st-root * { box-sizing: border-box; }

        .st-card {
          background: #fff;
          border: 1.5px solid #f0eef9;
          border-radius: 20px;
          padding: 24px;
        }

        .st-input {
          width: 100%; padding: 13px 16px;
          background: #fafafe;
          border: 1.5px solid #ede9fe;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 400;
          color: #1a1230; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .st-input:focus {
          border-color: #7c5cfc;
          box-shadow: 0 0 0 4px rgba(124,92,252,0.08);
        }
        .st-input::placeholder { color: #c4b5fd; }
        .st-input:disabled { opacity: 0.55; cursor: not-allowed; }

        .st-input-wrap { position: relative; }
        .st-input-prefix {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 15px;
          color: #a78bfa; pointer-events: none;
        }
        .st-input-wrap .st-input { padding-left: 30px; }

        .st-label {
          display: block; margin-bottom: 8px;
          font-family: 'Outfit', sans-serif; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em; color: #b8addb;
        }

        .st-save-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 28px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #1a1230, #2d1f6e);
          color: #fff; cursor: pointer;
          font-family: 'Outfit', sans-serif; font-size: 12px;
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(26,18,48,0.2);
        }
        .st-save-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #7c5cfc, #6366f1);
          box-shadow: 0 6px 20px rgba(124,92,252,0.35);
          transform: translateY(-1px);
        }
        .st-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .st-save-btn:active:not(:disabled) { transform: scale(0.98); }

        .st-logout-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 24px; border-radius: 12px; border: none;
          background: #fef2f2; color: #ef4444; cursor: pointer;
          font-family: 'Outfit', sans-serif; font-size: 12px;
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em;
          transition: all 0.2s;
        }
        .st-logout-btn:hover { background: #fee2e2; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .fa-spin { animation: spin 0.8s linear infinite; display: inline-block; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .st-fade { animation: fadeUp 0.35s ease forwards; }
        .st-fade-2 { animation: fadeUp 0.35s 0.07s ease both; }
        .st-fade-3 { animation: fadeUp 0.35s 0.14s ease both; }
        .st-fade-4 { animation: fadeUp 0.35s 0.21s ease both; }
      `}</style>

      <div
        className="st-root bg-white p-5 rounded-2xl"
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {/* ── Header ── */}
        <div className="st-fade">
          <p
            className="font-display"
            style={{
              margin: "0 0 4px",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#a78bfa",
            }}
          >
            Account
          </p>
          <h2
            className="font-display"
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 800,
              color: "#1a1230",
              lineHeight: 1.2,
            }}
          >
            Settings
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start st-fade-2">
          {/* ── LEFT column ── */}
          <div className="flex flex-col gap-4">
            {/* Profile photo */}
            <div className="st-card st-fade-2">
              <p className="st-label" style={{ marginBottom: 16 }}>
                Profile Photo
              </p>
              <AvatarUploader
                currentAvatar={avatarUrl}
                username={username}
                onUploaded={handleAvatarUploaded}
                showStatus={showStatus}
              />
            </div>

            {/* Profile info */}
            <div
              className="st-card st-fade-3"
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <p className="st-label" style={{ margin: 0 }}>
                Profile Information
              </p>

              <div>
                <label className="st-label">Display Name</label>
                <input
                  className="st-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="st-label">Username</label>
                <div className="st-input-wrap">
                  <span className="st-input-prefix">@</span>
                  <input
                    className="st-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                  />
                </div>
              </div>

              <div>
                <label className="st-label">Phone Number</label>
                <input
                  className="st-input"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +234 800 000 0000"
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Security / email */}
            <div className="st-card st-fade-2">
              <p className="st-label" style={{ marginBottom: 16 }}>
                Security
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: "#fafafe",
                  border: "1.5px solid #f0eef9",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#f0eef9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i
                      className="fa-solid fa-envelope"
                      style={{ color: "#7c5cfc", fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <p
                      className="font-display"
                      style={{
                        margin: "0 0 2px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#1a1230",
                      }}
                    >
                      Email Address
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "#9b8fc2" }}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 7,
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    fontFamily: "'Outfit',sans-serif",
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "#16a34a",
                  }}
                >
                  Verified
                </span>
              </div>

              {/* Password placeholder */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: "#fafafe",
                  border: "1.5px solid #f0eef9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#f0eef9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i
                      className="fa-solid fa-lock"
                      style={{ color: "#7c5cfc", fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <p
                      className="font-display"
                      style={{
                        margin: "0 0 2px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#1a1230",
                      }}
                    >
                      Password
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "#9b8fc2" }}>
                      Managed via your login provider
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account info card */}
            <div className="st-card st-fade-3">
              <p className="st-label" style={{ marginBottom: 16 }}>
                Account Details
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {[
                  {
                    label: "Member Since",
                    value: user.joinedAt
                      ? new Date(user.joinedAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                        })
                      : "—",
                    icon: "fa-calendar",
                  },
                  {
                    label: "Account ID",
                    value: `···${user.id?.slice(-8) || "—"}`,
                    icon: "fa-fingerprint",
                  },
                  {
                    label: "Account Type",
                    value: user.isAdmin ? "Administrator" : "Member",
                    icon: "fa-shield-halved",
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "#fafafe",
                      border: "1px solid #f0eef9",
                    }}
                  >
                    <i
                      className={`fa-solid ${row.icon}`}
                      style={{
                        color: "#c4b5fd",
                        fontSize: 13,
                        width: 16,
                        textAlign: "center",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 12, color: "#9b8fc2", flex: 1 }}>
                      {row.label}
                    </span>
                    <span
                      className="font-display"
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#1a1230",
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger zone */}
            <div
              className="st-card st-fade-4"
              style={{ border: "1.5px solid #fee2e2" }}
            >
              <p
                className="st-label"
                style={{ marginBottom: 12, color: "#fca5a5" }}
              >
                Danger Zone
              </p>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "#9b8fc2" }}>
                Signing out will end your current session.
              </p>
              <button className="st-logout-btn" onClick={logout}>
                <i className="fa-solid fa-arrow-right-from-bracket" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* ── Save bar ── */}
        <div className="st-fade-4 flex flex-col md:flex-row items-start gap-y-3 md:items-center justify-between py-4 px-6 rounded-xl bg-white border border-[#f0eef9] box-shadow-[0_4px_16px_rgba(124,92,252,0.06)]">
          <div>
            <p
              className="font-display"
              style={{
                margin: "0 0 2px",
                fontSize: 13,
                fontWeight: 700,
                color: "#1a1230",
              }}
            >
              Save your changes
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#b8addb" }}>
              Name and username updates apply immediately.
            </p>
          </div>
          <button
            className="st-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" /> Saving…
              </>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
