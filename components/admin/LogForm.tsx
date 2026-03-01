import React from "react";
import {
  MasterAccount,
  ProductCategory,
  FulfillmentType,
} from "@/constants/types";
import { PRESET_ICONS } from "@/constants/types";

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

  console.log("yes changed", formData);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-200">
      {/* Form header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <i
              className={`fa-solid ${editingId ? "fa-pen-to-square" : "fa-plus"}`}
            />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">
              {editingId ? "Edit Log Entry" : "New Log Entry"}
            </h3>
            <p className="text-slate-400 text-xs font-medium mt-0.5">
              {editingId
                ? "Update the details below"
                : "Fill in the subscription details"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {/* Row 1: Service info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="Service Name">
            <input
              type="text"
              required
              placeholder="e.g. Netflix Premium"
              className="input"
              value={formData.service_name}
              onChange={(e) => set({ service_name: e.target.value })}
            />
          </Field>
          <Field label="Category">
            <select
              className="input"
              value={formData.category}
              onChange={(e) =>
                set({ category: e.target.value as ProductCategory })
              }
            >
              {Object.values(ProductCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Fulfillment Method">
            <select
              className="input border-indigo-100 text-indigo-600 font-black"
              value={formData.fulfillment_type}
              onChange={(e) =>
                set({ fulfillment_type: e.target.value as FulfillmentType })
              }
            >
              <option value="Password">Direct Password</option>
              <option value="Invite Link">Invite Link</option>
              <option value="OTP / Instruction">OTP / Instructions</option>
            </select>
          </Field>
        </div>

        {/* Row 2: Pricing & slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="Price (₦/month)">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">
                ₦
              </span>
              <input
                type="number"
                required
                className="input pl-8"
                value={formData.price}
                onChange={(e) => set({ price: parseFloat(e.target.value) })}
              />
            </div>
          </Field>
          <Field label="Original Price (₦)" hint="Used to show discount">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">
                ₦
              </span>
              <input
                type="number"
                className="input pl-8"
                value={formData.original_price}
                onChange={(e) =>
                  set({ original_price: parseFloat(e.target.value) })
                }
              />
            </div>
          </Field>
          <Field label="Total Slots">
            <input
              type="number"
              required
              min={1}
              className="input"
              value={formData.total_slots}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                set({ total_slots: v, available_slots: v });
              }}
            />
          </Field>
        </div>

        {/* Row 3: Credentials */}
        <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 space-y-5">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 flex items-center gap-2">
            <i className="fa-solid fa-lock text-[8px]" />
            Sensitive Credentials — Never visible to buyers
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              label={
                formData.fulfillment_type === "Invite Link"
                  ? "Activation Link"
                  : "Log Email / ID"
              }
            >
              <input
                type="text"
                required
                className="input bg-white border-indigo-50"
                value={formData.master_email}
                onChange={(e) => set({ master_email: e.target.value })}
                placeholder={
                  formData.fulfillment_type === "Invite Link"
                    ? "https://..."
                    : "account@email.com"
                }
              />
            </Field>
            <Field
              label={
                formData.fulfillment_type === "OTP / Instruction"
                  ? "Setup Instructions"
                  : "Log Password"
              }
            >
              <input
                type={
                  formData.fulfillment_type === "OTP / Instruction"
                    ? "text"
                    : "password"
                }
                required
                className="input bg-white border-indigo-50"
                value={formData.master_password}
                onChange={(e) => set({ master_password: e.target.value })}
                placeholder={
                  formData.fulfillment_type === "OTP / Instruction"
                    ? "Step-by-step instructions..."
                    : "••••••••"
                }
              />
            </Field>
          </div>
        </div>

        {/* Icon picker */}
        <Field label="Service Icon">
          <div className="flex flex-wrap gap-3 mt-2">
            {PRESET_ICONS.map((icon) => (
              <button
                key={icon.url}
                type="button"
                onClick={() => set({ icon_url: icon.url })}
                title={icon.name}
                className={`relative p-1 rounded-2xl border-2 transition-all ${
                  formData.icon_url === icon.url
                    ? "border-indigo-600 scale-110 shadow-lg shadow-indigo-100"
                    : "border-transparent opacity-40 hover:opacity-70"
                }`}
              >
                <img
                  src={icon.url}
                  className="h-12 w-12 rounded-xl object-cover"
                  alt={icon.name}
                />
                {formData.icon_url === icon.url && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-indigo-600 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-check text-white text-[7px]" />
                  </span>
                )}
              </button>
            ))}
            <input
              type="text"
              placeholder="Custom image URL..."
              className="input flex-1 min-w-32 text-xs"
              value={formData.icon_url}
              onChange={(e) => set({ icon_url: e.target.value })}
            />
          </div>
        </Field>

        {/* Description */}
        <Field label="Description / Internal Notes">
          <textarea
            className="input h-24 resize-none"
            value={formData.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="Tell users about this subscription..."
          />
        </Field>

        {/* Actions */}
        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <i className="fa-solid fa-spinner fa-spin" />}
            {editingId ? "Update Log" : "Launch Log to Marketplace"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-8 bg-slate-100 text-slate-400 font-black uppercase tracking-widest rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>

      <style>{`
        .input {
          width: 100%;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          padding: 1rem;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.15s;
        }
        .input:focus {
          border-color: #6366f1;
          background: white;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
        }
      `}</style>
    </div>
  );
};

// ─── Field wrapper ─────────────────────────────────────────────────────────────

const Field: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between ml-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </label>
      {hint && (
        <span className="text-[9px] text-slate-300 font-medium">{hint}</span>
      )}
    </div>
    {children}
  </div>
);
