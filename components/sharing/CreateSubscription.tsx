import React, { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { useAuth } from "@/providers/auth";

export const CreateSubscription: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    max_seats: 4,
    monthly_price: 0,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo must be under 2MB");
        return;
      }
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let logo_url = "";

      if (logo) {
        const fileExt = logo.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("subscription-logos")
          .upload(filePath, logo);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("subscription-logos")
          .getPublicUrl(filePath);
        
        logo_url = data.publicUrl;
      }

      const { error: insertError } = await supabase.from("subscriptions").insert([
        {
          ...formData,
          logo_url,
          created_by: user.id,
        },
      ]);

      if (insertError) throw insertError;

      toast.success("Subscription created successfully!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to create subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-lg mx-auto">
      <h2 className="text-xl font-black text-slate-900 mb-6 font-display">Create Subscription</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">
            Subscription Name
          </label>
          <input
            type="text"
            required
            className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm"
            placeholder="e.g. Netflix Premium"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">
            Description
          </label>
          <textarea
            className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm h-24"
            placeholder="What's included in this sharing plan?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">
              Max Seats
            </label>
            <input
              type="number"
              min="1"
              required
              className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm"
              value={formData.max_seats}
              onChange={(e) => setFormData({ ...formData, max_seats: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">
              Monthly Price (Full)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm"
              value={formData.monthly_price}
              onChange={(e) => setFormData({ ...formData, monthly_price: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">
            Logo
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer hover:border-indigo-400 transition-colors"
          >
            {logoPreview ? (
              <img src={logoPreview} alt="Preview" className="h-20 w-20 object-contain" />
            ) : (
              <div className="space-y-1 text-center">
                <i className="fa-solid fa-cloud-arrow-up text-slate-300 text-2xl mb-2 block" />
                <div className="flex text-sm text-slate-600">
                  <span>Upload a file</span>
                </div>
                <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 2MB</p>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
        >
          {loading && <i className="fa-solid fa-spinner fa-spin" />}
          Create Plan
        </button>
      </form>
    </div>
  );
};
