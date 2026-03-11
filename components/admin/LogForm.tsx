import React, { useState } from "react";
import {
  MasterAccount,
  ProductCategory,
  FulfillmentType,
  Platform,
} from "@/constants/types";
import { ServicePicker, logoUrl } from "../ServicePicker";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

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
  const [persistCustom, setPersistCustom] = useState(false);
  const [savingCustom, setSavingCustom] = useState(false);

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
    formData.service_name && formData.icon_url
      ? {
          name: formData.service_name,
          domain: (formData as any)._domain ?? "",
          category: (formData as any)._category ?? "Streaming",
        }
      : null;

  const handlePlatformChange = (p: Platform) => {
    set({
      service_name: p.name,
      icon_url: logoUrl(p.domain, 256),
      category: CATEGORY_MAP[p.category] ?? ProductCategory.STREAMING,
      _domain: p.domain,
      _category: p.category,
    } as any);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (persistCustom && selectedPlatform && !selectedPlatform.domain) {
      setSavingCustom(true);
      try {
        const { error } = await supabase.from("custom_platforms").insert({
          name: selectedPlatform.name,
          category: selectedPlatform.category,
          icon_url: formData.icon_url,
        });
        if (error) throw error;
        toast.success("Platform saved to directory!");
      } catch (err: any) {
        console.error("Failed to save custom platform:", err);
        toast.error("Couldn't save platform to directory, but proceeding with listing.");
      } finally {
        setSavingCustom(false);
      }
    }

    onSubmit(e);
  };

  const isInvite = formData.fulfillment_type === "Invite Link";
  const isOtp = formData.fulfillment_type === "OTP / Instruction";

  const discountPct =
    (formData.price ?? 0) > 0 &&
    (formData.original_price ?? 0) > (formData.price ?? 0)
      ? Math.round(
          (((formData.original_price ?? 0) - (formData.price ?? 0)) /
            (formData.original_price ?? 1)) *
            100,
        )
      : null;

  return (
    <>
      <div className="h-1 bg-linear-to-r from-violet-500 via-indigo-500 to-cyan-400 rounded-t-4xl" />

      <div className="p-7 md:p-9">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              {formData.icon_url ? (
                <img
                  src={formData.icon_url}
                  alt=""
                  className="h-12 w-12 rounded-2xl object-contain border border-slate-100 shadow-sm bg-slate-50 p-0.5"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.service_name || "S")}&background=6366f1&color=fff&size=128`;
                  }}
                />
              ) : (
                <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                  <i className="fa-solid fa-layer-group text-indigo-400" />
                </div>
              )}
              {formData.service_name && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                  <i
                    className="fa-solid fa-check text-white"
                    style={{ fontSize: 7 }}
                  />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {editingId ? "Edit Log Entry" : "New Log Entry"}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {formData.service_name
                  ? `Configuring ${formData.service_name}`
                  : "Start by selecting a platform below"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all shrink-0"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleFinalSubmit} className="space-y-7">
          <Section n="1" title="Platform" sub="Choose the subscription service">
            <ServicePicker
              value={selectedPlatform}
              onChange={handlePlatformChange}
              isAdmin={true}
            />
            {formData.service_name && (
              <div className="mt-3 flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Listing label" hint="Override name if needed">
                    <Input
                      value={formData.service_name ?? ""}
                      onChange={(v) => set({ service_name: v })}
                      placeholder="e.g. Netflix 4K Family"
                    />
                  </Field>
                  <Field label="Category">
                    <select
                      className="field-input"
                      value={formData.category}
                      onChange={(e) =>
                        set({ category: e.target.value as ProductCategory })
                      }
                    >
                      {Object.values(ProductCategory).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {selectedPlatform && !selectedPlatform.domain && (
                  <label className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="peer sr-only"
                        checked={persistCustom}
                        onChange={e => setPersistCustom(e.target.checked)}
                      />
                      <div className="h-5 w-5 rounded-md border-2 border-slate-300 bg-white transition-all peer-checked:border-indigo-600 peer-checked:bg-indigo-600" />
                      <i className="fa-solid fa-check absolute text-[10px] text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-slate-700 group-hover:text-indigo-700 transition-colors">
                        Remember this platform
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Add "{formData.service_name}" to the searchable directory for next time.
                      </p>
                    </div>
                  </label>
                )}
              </div>
            )}
          </Section>

          <Section
            n="2"
            title="Pricing & Slots"
            sub="How much members pay and how many can join"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Your Price / month">
                <NairaInput
                  value={formData.price}
                  onChange={(v) => set({ price: v })}
                  placeholder="3,500"
                />
              </Field>
              <Field label="Original Price" hint="shows % off">
                <NairaInput
                  value={formData.original_price}
                  onChange={(v) => set({ original_price: v })}
                  placeholder="12,000"
                />
              </Field>
              <Field label="Total Slots">
                <div className="relative">
                  <Input
                    type="number"
                    value={String(formData.total_slots ?? "")}
                    onChange={(v) => {
                      const n = parseInt(v) || 0;
                      if (editingId && initialTaken.current !== null) {
                        set({ 
                          total_slots: n, 
                          available_slots: Math.max(0, n - initialTaken.current) 
                        });
                      } else {
                        set({ total_slots: n, available_slots: n });
                      }
                    }}
                    placeholder="5"
                    min="1"
                    max="20"
                    className="pr-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase tracking-wider select-none">
                    slots
                  </span>
                </div>
              </Field>
            </div>

            {discountPct && (
              <div className="flex items-center gap-3 mt-3 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <div className="h-8 w-8 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-tag text-white text-xs" />
                </div>
                <div>
                  <p className="text-xs font-black text-emerald-700">
                    {discountPct}% discount shown to buyers
                  </p>
                  <p className="text-[10px] text-emerald-600 font-medium">
                    Members save ₦
                    {(
                      (formData.original_price ?? 0) - (formData.price ?? 0)
                    ).toLocaleString()}{" "}
                    / month
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4">
              <Field label="Fulfillment method">
                <div className="grid grid-cols-3 gap-2">
                  {(
                    ["Password", "Invite Link", "OTP / Instruction"] as const
                  ).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        set({ fulfillment_type: opt as FulfillmentType })
                      }
                      className={`py-3 px-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider transition-all leading-tight text-center ${
                        formData.fulfillment_type === opt
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                      }`}
                    >
                      <i
                        className={`fa-solid block mb-1.5 text-sm ${
                          opt === "Password"
                            ? "fa-key"
                            : opt === "Invite Link"
                              ? "fa-link"
                              : "fa-qrcode"
                        }`}
                      />
                      {opt}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </Section>

          <Section
            n="3"
            title="Credentials"
            sub="Encrypted — only revealed after successful purchase"
          >
            <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl mb-4">
              <i className="fa-solid fa-shield-halved text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[11px] font-semibold text-amber-700 leading-relaxed">
                These details are never shown publicly. Members only see them
                after a verified purchase.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label={
                  isInvite ? "Invite / Activation link" : "Account email or ID"
                }
              >
                <Input
                  required
                  value={formData.master_email ?? ""}
                  onChange={(v) => set({ master_email: v })}
                  placeholder={isInvite ? "https://..." : "account@email.com"}
                />
              </Field>
              <Field label={isOtp ? "Setup instructions" : "Account password"}>
                <Input
                  type={isOtp ? "text" : "password"}
                  required
                  value={formData.master_password ?? ""}
                  onChange={(v) => set({ master_password: v })}
                  placeholder={isOtp ? "Step-by-step guide..." : "••••••••"}
                />
              </Field>
            </div>
          </Section>

          <Section
            n="4"
            title="Description"
            sub="Optional — displayed on the marketplace card"
          >
            <textarea
              className="field-input h-24 resize-none"
              value={formData.description ?? ""}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="e.g. Netflix 4K UHD · Family plan · 5 screens · Stable account, no region issues."
            />
          </Section>

          <div className="flex gap-3 pt-1 pb-1">
            <button
              type="submit"
              disabled={isLoading || savingCustom || !formData.service_name}
              className="flex-1 flex items-center justify-center gap-2.5 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100/40 disabled:opacity-40"
            >
              {(isLoading || savingCustom) ? (
                <i className="fa-solid fa-spinner fa-spin" />
              ) : (
                <i className="fa-solid fa-rocket-launch text-xs" />
              )}
              {editingId ? "Save Changes" : "Launch to Marketplace"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-7 bg-slate-100 text-slate-500 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .field-input {
          width: 100%;
          background: #f8fafc;
          border: 1.5px solid #f1f5f9;
          padding: 12px 16px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 0.875rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }
        .field-input:focus {
          border-color: #6366f1;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(99,102,241,0.1);
        }
        .field-input::placeholder { color: #94a3b8; font-weight: 500; }
        .field-input option { font-weight: 600; }
      `}</style>
    </>
  );
};

const Section: React.FC<{
  n: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}> = ({ n, title, sub, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="h-7 w-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[11px] font-black shrink-0">
        {n}
      </div>
      <div>
        <p className="text-sm font-black text-slate-900">{title}</p>
        <p className="text-[10px] text-slate-400 font-medium">{sub}</p>
      </div>
    </div>
    {children}
  </div>
);

const Field: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between px-0.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </label>
      {hint && (
        <span className="text-[9px] italic text-slate-300 font-medium">
          {hint}
        </span>
      )}
    </div>
    {children}
  </div>
);

const Input: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & {
    onChange?: (v: string) => void;
  }
> = ({ onChange, className = "", ...props }) => (
  <input
    {...props}
    className={`field-input ${className}`}
    onChange={
      onChange ? (e) => onChange(e.target.value) : (props.onChange as any)
    }
  />
);

const NairaInput: React.FC<{
  value?: number;
  onChange: (v: number) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm select-none">
      ₦
    </span>
    <input
      type="number"
      min={0}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="field-input pl-8"
    />
  </div>
);
