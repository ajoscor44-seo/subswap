import React, { useState, useRef } from "react";
import {
  MasterAccount,
  ProductCategory,
  FulfillmentType,
  Platform,
} from "@/constants/types";
import { ServicePicker, logoUrl } from "../ServicePicker";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { useCloudinaryUpload } from "../SettingsTab";

const CATEGORY_MAP: Record<string, ProductCategory> = {
  Streaming: ProductCategory.STREAMING,
  Music: ProductCategory.MUSIC,
  "AI & Writing": ProductCategory.AI,
  "Privacy & Security": ProductCategory.VPN,
  Design: ProductCategory.DESIGN,
  Education: ProductCategory.EDUCATION,
  "SEO & Marketing": ProductCategory.MARKETING,
  Productivity: ProductCategory.PRODUCTIVITY,
  Gaming: ProductCategory.GAMING,
};

interface LogFormProps {
  editingId: string | null;
  formData: Partial<MasterAccount>;
  isLoading: boolean;
  onChange: (data: Partial<MasterAccount>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const LogForm: React.FC<LogFormProps> = (props) => {
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-250 flex items-center justify-center p-4 md:p-8"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) props.onCancel();
      }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-4xl bg-white shadow-2xl animate-in zoom-in-95 fade-in duration-200"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <LogFormInner {...props} />
      </div>
    </div>
  );
};

const LogFormInner: React.FC<LogFormProps> = ({
  editingId,
  formData,
  isLoading,
  onChange,
  onSubmit,
  onCancel,
}) => {
  const [isCustom, setIsCustom] = useState(false);
  const [persistCustom, setPersistCustom] = useState(false);
  const [savingCustom, setSavingCustom] = useState(false);
  const { upload, uploading } = useCloudinaryUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<MasterAccount>) =>
    onChange({ ...formData, ...patch });

  const initialTaken = React.useRef<number | null>(null);
  
  React.useEffect(() => {
    if (editingId && formData.total_slots !== undefined && formData.available_slots !== undefined) {
      if (initialTaken.current === null) {
        initialTaken.current = formData.total_slots - formData.available_slots;
      }
    } else if (!editingId) {
      initialTaken.current = null;
    }
  }, [editingId, formData.total_slots, formData.available_slots]);

  const selectedPlatform: Platform | null =
    formData.service_name 
      ? {
          name: formData.service_name,
          domain: (formData as any)._domain ?? "",
          category: (formData as any)._category ?? "Streaming",
        }
      : null;

  const handlePlatformChange = (p: Platform) => {
    set({
      service_name: p.name,
      icon_url: p.domain 
        ? logoUrl(p.domain, 256)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=6366f1&color=fff&size=128`,
      category: CATEGORY_MAP[p.category] ?? ProductCategory.STREAMING,
      _domain: p.domain,
      _category: p.category,
    } as any);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await upload(file);
      set({ icon_url: url });
      toast.success("Logo uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCustom && persistCustom) {
      setSavingCustom(true);
      try {
        const { error } = await supabase.from("custom_platforms").insert({
          name: formData.service_name,
          category: formData.category,
          icon_url: formData.icon_url,
          domain: (formData as any)._domain || ""
        });
        if (error) throw error;
      } catch (err: any) {
        console.error("Persist failed:", err);
      } finally {
        setSavingCustom(false);
      }
    }

    onSubmit(e);
  };

  const isInvite = formData.fulfillment_type === "Invite Link";
  const isOtp = formData.fulfillment_type === "OTP / Instruction";

  return (
    <>
      <div className="h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-4xl" />

      <div className="p-7 md:p-9">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => isCustom && fileInputRef.current?.click()}>
              {formData.icon_url ? (
                <img
                  src={formData.icon_url}
                  alt=""
                  className="h-14 w-14 rounded-2xl object-contain border border-slate-100 shadow-sm bg-slate-50 p-1"
                />
              ) : (
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center border-2 border-dashed border-indigo-200">
                  <i className="fa-solid fa-image text-indigo-300" />
                </div>
              )}
              {isCustom && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <i className="fa-solid fa-camera text-white text-xs" />
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 font-display">
                {editingId ? "Edit Listing" : "New Listing"}
              </h3>
              <p className="text-xs text-slate-400 font-medium font-display uppercase tracking-wider">
                {formData.service_name || "Configure Plan"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="h-10 w-10 rounded-2xl bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        <form onSubmit={handleFinalSubmit} className="space-y-8">
          {/* Section 1: Platform */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 font-display">
                1. Platform Details
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="peer sr-only" 
                  checked={isCustom} 
                  onChange={e => setIsCustom(e.target.checked)} 
                />
                <div className="h-4 w-8 rounded-full bg-slate-200 peer-checked:bg-indigo-600 transition-colors relative">
                  <div className="absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors uppercase tracking-wider">Custom Platform</span>
              </label>
            </div>

            {isCustom ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Platform Name</label>
                  <input
                    required
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm"
                    placeholder="e.g. My Premium App"
                    value={formData.service_name || ""}
                    onChange={e => set({ service_name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Category</label>
                  <select
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm appearance-none"
                    value={formData.category}
                    onChange={e => set({ category: e.target.value as ProductCategory })}
                  >
                    {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={persistCustom}
                      onChange={e => setPersistCustom(e.target.checked)}
                    />
                    <div className="h-5 w-5 rounded-lg border-2 border-slate-300 bg-white flex items-center justify-center transition-all peer-checked:border-indigo-600 peer-checked:bg-indigo-600">
                      <i className="fa-solid fa-check text-[10px] text-white opacity-0 peer-checked:opacity-100" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-slate-700 group-hover:text-indigo-700 transition-colors">Add to directory</p>
                      <p className="text-[10px] text-slate-400 font-medium">Make this platform searchable for future listings.</p>
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              <ServicePicker
                value={selectedPlatform}
                onChange={handlePlatformChange}
              />
            )}
          </section>

          {/* Section 2: Pricing & Seats */}
          <section className="space-y-4 pt-4 border-t border-slate-100">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 font-display block">
              2. Pricing & Capacity
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Price / mo</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-indigo-400">₦</span>
                  <input
                    type="number"
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-8 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm"
                    value={formData.price || ""}
                    onChange={e => set({ price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Retail Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">₦</span>
                  <input
                    type="number"
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-8 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm"
                    value={formData.original_price || ""}
                    onChange={e => set({ original_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Total Seats</label>
                <input
                  type="number"
                  className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm"
                  value={formData.total_slots || ""}
                  onChange={e => {
                    const n = parseInt(e.target.value) || 0;
                    if (editingId && initialTaken.current !== null) {
                      set({ total_slots: n, available_slots: Math.max(0, n - initialTaken.current) });
                    } else {
                      set({ total_slots: n, available_slots: n });
                    }
                  }}
                />
              </div>
            </div>
          </section>

          {/* Section 3: Credentials */}
          <section className="space-y-4 pt-4 border-t border-slate-100">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 font-display block">
              3. Delivery Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Password", "Invite Link", "OTP / Instruction"] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => set({ fulfillment_type: opt })}
                  className={`py-3 rounded-xl border-2 transition-all text-[10px] font-black uppercase tracking-wider ${
                    formData.fulfillment_type === opt 
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm" 
                      : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                  {isInvite ? "Invite URL" : "Master Email"}
                </label>
                <input
                  required
                  className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm"
                  value={formData.master_email || ""}
                  onChange={e => set({ master_email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                  {isOtp ? "Instructions" : "Master Password"}
                </label>
                <input
                  type={isOtp ? "text" : "password"}
                  required
                  className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm"
                  value={formData.master_password || ""}
                  onChange={e => set({ master_password: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 font-display block">
              4. Additional Info
            </label>
            <textarea
              className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm h-24 resize-none"
              placeholder="Features, region notes, etc."
              value={formData.description || ""}
              onChange={e => set({ description: e.target.value })}
            />
          </section>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || uploading || savingCustom || !formData.service_name}
              className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 disabled:opacity-40 flex items-center justify-center gap-3"
            >
              {(isLoading || uploading || savingCustom) ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-rocket text-xs" />}
              {editingId ? "Save Changes" : "Launch Listing"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-8 bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
