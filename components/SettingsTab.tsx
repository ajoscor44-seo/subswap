import React, { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@/constants/types";

// ─── Cloudinary upload hook ────────────────────────────────────────────────────

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default";

export const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File): Promise<string> => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "discountzar/avatars");

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        setUploading(false);
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve(data.secure_url);
        } else {
          reject(new Error("Upload failed"));
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        reject(new Error("Network error during upload"));
      };

      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      );
      xhr.send(formData);
    });
  };

  return { upload, uploading, progress };
};

// ─── Avatar uploader component ────────────────────────────────────────────────

interface AvatarUploaderProps {
  currentAvatar: string;
  username: string;
  onUploaded: (url: string) => void;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatar,
  username,
  onUploaded,
}) => {
  const { upload, uploading, progress } = useCloudinaryUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    setError(null);

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const url = await upload(file);
      onUploaded(url);
    } catch (err: any) {
      setError(err.message || "Upload failed. Try again.");
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const displaySrc = preview || currentAvatar;

  return (
    <div className="flex items-center gap-6">
      {/* Avatar preview */}
      <div className="relative shrink-0">
        <img
          src={displaySrc}
          className="h-20 w-20 rounded-2xl object-cover border-4 border-white shadow-xl"
          alt={username}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://ui-avatars.com/api/?name=${username}&background=6366f1&color=fff`;
          }}
        />

        {/* Upload progress ring */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
            <div className="text-center">
              <i className="fa-solid fa-spinner fa-spin text-white text-lg" />
              <p className="text-white text-[10px] font-black mt-1">
                {progress}%
              </p>
            </div>
          </div>
        )}

        {/* Edit button */}
        {!uploading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute -bottom-2 -right-2 h-8 w-8 bg-indigo-600 rounded-xl border-2 border-white flex items-center justify-center text-white hover:bg-indigo-700 transition-all shadow-lg"
          >
            <i className="fa-solid fa-camera text-[10px]" />
          </button>
        )}
      </div>

      {/* Drop zone / text */}
      <div
        className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {uploading ? (
          <div className="space-y-2">
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs font-bold text-indigo-600">
              Uploading... {progress}%
            </p>
          </div>
        ) : (
          <>
            <i className="fa-solid fa-cloud-arrow-up text-slate-300 text-xl mb-2 block" />
            <p className="text-xs font-bold text-slate-500">
              Drop image here or{" "}
              <span className="text-indigo-600 underline">browse</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              PNG, JPG, WEBP · Max 5MB
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && (
        <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
          <i className="fa-solid fa-circle-exclamation" />
          {error}
        </p>
      )}
    </div>
  );
};

// ─── SettingsTab ──────────────────────────────────────────────────────────────

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
  const [name, setName] = useState(user.name || "");
  const [username, setUsername] = useState(user.username || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || "");
  const [saving, setSaving] = useState(false);

  const handleAvatarUploaded = async (url: string) => {
    setAvatarUrl(url);
    // Immediately persist to Supabase
    const { error } = await supabase
      .from("profiles")
      .update({ avatar: url })
      .eq("id", user.id);

    if (error) {
      showStatus("Failed to update avatar", "error");
    } else {
      showStatus("Profile photo updated!", "success");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          username,
          avatar: avatarUrl,
        })
        .eq("id", user.id);

      if (error) throw error;
      showStatus("Profile updated successfully!", "success");
    } catch (err: any) {
      showStatus(err.message || "Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-4xl md:rounded-[2.5rem] p-6 md:p-12 shadow-sm border border-slate-100 animate-in fade-in duration-500">
      <div className="mb-8 md:mb-12">
        <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Account Settings
        </h3>
        <p className="text-slate-500 text-sm font-medium">
          Manage your profile and preferences.
        </p>
      </div>

      <div className="max-w-xl space-y-8">
        {/* Avatar */}
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Profile Photo
          </p>
          <AvatarUploader
            currentAvatar={avatarUrl}
            username={username}
            onUploaded={handleAvatarUploaded}
          />
        </div>

        {/* Profile fields */}
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Profile Information
          </p>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600 transition-all"
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600 transition-all"
                  placeholder="username"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Security
          </p>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-black text-slate-900 text-sm">
                Email Address
              </h4>
              <p className="text-slate-500 text-xs font-medium mt-0.5">
                {user.email}
              </p>
            </div>
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg font-black text-[8px] uppercase tracking-widest">
              Verified
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-slate-50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <i className="fa-solid fa-spinner fa-spin" />}
            Save Changes
          </button>
          <button
            onClick={logout}
            className="px-8 py-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
