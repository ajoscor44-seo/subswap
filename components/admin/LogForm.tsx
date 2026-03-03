import React from "react";
import {
  MasterAccount,
  ProductCategory,
  FulfillmentType,
  Platform,
} from "@/constants/types";
import { ServicePicker, logoUrl } from "../ServicePicker";
import { CATEGORY_MAP } from "@/constants/data";

interface LogFormProps {
  editingId: string | null;
  formData: Partial<MasterAccount>;
  isLoading: boolean;
  onChange: (data: Partial<MasterAccount>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const LogForm: React.FC<LogFormProps> = ({
  editingId,
  formData,
  isLoading,
  onChange,
  onSubmit,
  onCancel,
}) => {
  const set = (patch: Partial<MasterAccount>) =>
    onChange({ ...formData, ...patch });

  const selectedPlatform: Platform | null =
    formData.service_name && formData.icon_url
      ? {
          name: formData.service_name,
          domain: formData._domain ?? "",
          category: (formData._category as any) ?? "Streaming",
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

  const isInvite = formData.fulfillment_type === "Invite Link";
  const isOtp = formData.fulfillment_type === "OTP / Instruction";

  const discountPct =
    formData.price > 0 && formData.original_price > formData.price
      ? Math.round(
          ((formData.original_price - formData.price) /
            formData.original_price) *
            100,
        )
      : null;

  return (
    <div className="bg-white rounded-4xl border border-slate-200/80 overflow-hidden shadow-2xl shadow-slate-200/60 animate-in slide-in-from-top-3 duration-200">
      <div className="h-1 bg-linear-to-r from-violet-500 via-indigo-500 to-cyan-400" />

      <div className="p-7 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              {formData.icon_url ? (
                <img
                  src={formData.icon_url}
                  alt=""
                  className="h-12 w-12 rounded-2xl object-contain border border-slate-100 shadow-sm bg-slate-50 p-0.5"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = "0";
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
            className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-7">
          <Section n="1" title="Platform" sub="Choose the subscription service">
            <div className="relative">
              <ServicePicker
                value={selectedPlatform}
                onChange={handlePlatformChange}
              />
            </div>

            {formData.service_name && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      const n = parseInt(v);
                      set({ total_slots: n, available_slots: n });
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
                      formData.original_price! - formData.price!
                    ).toLocaleString()}{" "}
                    per month
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
                      <span className="mt-2 ml-2">{opt}</span>
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

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isLoading || !formData.service_name}
              className="flex-1 flex items-center justify-center gap-2.5 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100/40 disabled:opacity-40"
            >
              {isLoading ? (
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
    </div>
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
