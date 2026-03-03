import { INITIAL_FORM, MasterAccount } from "@/constants/types";
import React, { useState } from "react";
import { SearchBar } from "./SearchBar";
import { LogForm } from "./LogForm";

interface AdminInventoryProps {
  accounts: MasterAccount[];
  isLoading: boolean;
  onRefresh: () => void;
  onAdd: (data: Partial<MasterAccount>) => Promise<void>;
  onUpdate: (id: string, data: Partial<MasterAccount>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const AdminInventory: React.FC<AdminInventoryProps> = ({
  accounts,
  isLoading,
  onRefresh,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] =
    useState<Partial<MasterAccount>>(INITIAL_FORM);
  const [search, setSearch] = useState("");

  const filtered = accounts.filter(
    (a) =>
      a.service_name.toLowerCase().includes(search.toLowerCase()) ||
      a.master_email.toLowerCase().includes(search.toLowerCase()) ||
      a.category?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = (acc: MasterAccount) => {
    setFormData(acc);
    setEditingId(acc.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(INITIAL_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await onUpdate(editingId, formData);
    } else {
      await onAdd(formData);
    }
    handleCancel();
  };

  const slotFillPct = (acc: MasterAccount) =>
    Math.round(
      ((acc.total_slots - acc.available_slots) / acc.total_slots) * 100,
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search logs, emails, categories..."
        />
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              if (!showForm) {
                setShowForm(true);
              } else {
                handleCancel();
              }
            }}
            className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <i className={`fa-solid ${showForm ? "fa-xmark" : "fa-plus"}`} />
            {showForm ? "Close Form" : "Add Log"}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <LogForm
          editingId={editingId}
          formData={formData}
          isLoading={isLoading}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      {/* Summary bar */}
      <div className="flex gap-6 px-1">
        {[
          {
            label: "Total Logs",
            value: accounts.length,
            color: "text-slate-900",
          },
          {
            label: "Available Slots",
            value: accounts.reduce((a, b) => a + b.available_slots, 0),
            color: "text-emerald-600",
          },
          {
            label: "Occupied Slots",
            value: accounts.reduce(
              (a, b) => a + (b.total_slots - b.available_slots),
              0,
            ),
            color: "text-indigo-600",
          },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className={`text-lg font-black ${s.color}`}>{s.value}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-4xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-7 py-5">Service</th>
                <th className="px-7 py-5">Type</th>
                <th className="px-7 py-5">Credentials</th>
                <th className="px-7 py-5">Occupancy</th>
                <th className="px-7 py-5 text-right">Price</th>
                <th className="px-7 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((acc) => {
                const pct = slotFillPct(acc);
                const full = acc.available_slots === 0;
                return (
                  <tr
                    key={acc.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={acc.icon_url}
                            className="h-10 w-10 rounded-xl object-cover shadow-sm"
                            alt=""
                          />
                          {full && (
                            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-red-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div>
                          <span className="font-black text-slate-900 text-sm block">
                            {acc.service_name}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">
                            {acc.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-7 py-5">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                        {acc.fulfillment_type || "Password"}
                      </span>
                    </td>
                    <td className="px-7 py-5 max-w-45">
                      <span className="text-xs font-bold text-slate-700 truncate block">
                        {acc.master_email}
                      </span>
                      <span className="text-[9px] text-slate-300 font-mono tracking-widest">
                        ••••••••
                      </span>
                    </td>
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct >= 100
                                ? "bg-red-500"
                                : pct >= 70
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 whitespace-nowrap">
                          {acc.available_slots}/{acc.total_slots}
                        </span>
                      </div>
                    </td>
                    <td className="px-7 py-5 text-right">
                      <div>
                        <span className="font-black text-slate-900 text-sm block">
                          ₦{acc.price.toLocaleString()}
                        </span>
                        {acc.original_price > acc.price && (
                          <span className="text-[9px] text-slate-300 line-through">
                            ₦{acc.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-7 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(acc)}
                          className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 hover:bg-indigo-600 hover:text-white transition-all"
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen-to-square text-xs" />
                        </button>
                        <button
                          onClick={() => onDelete(acc.id)}
                          className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 hover:bg-red-500 hover:text-white transition-all"
                          title="Delete"
                        >
                          <i className="fa-solid fa-trash text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <i className="fa-solid fa-box-open text-slate-200 text-4xl mb-4 block" />
                    <span className="text-slate-400 font-black uppercase tracking-widest text-xs">
                      No logs found
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
