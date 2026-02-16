
import React, { useState } from 'react';
import { MasterAccount } from '../types';

export const AdminPanel: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<MasterAccount>>({
    service_name: '',
    master_email: '',
    master_password: '',
    total_slots: 5,
    available_slots: 5,
    price: 0,
    description: '',
    icon_url: 'https://picsum.photos/id/10/200/200'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting new master account:', formData);
    alert('Success: New master account added to the database.');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Inventory</h1>
          <p className="text-slate-500 mt-1">Manage master accounts, update passwords, and monitor slot sales.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          {showAddForm ? 'Cancel' : '+ Add New Master Account'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800">New Master Account Details</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix Premium 4K"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Price (USD / month)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Master Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.master_email}
                  onChange={(e) => setFormData({ ...formData, master_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Master Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.master_password}
                  onChange={(e) => setFormData({ ...formData, master_password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Total Slots</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.total_slots}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFormData({ ...formData, total_slots: val, available_slots: val });
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Service Icon URL</label>
                <input
                  type="url"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.icon_url}
                  onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-slate-700">Short Description</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="px-10 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Create Account Entry
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Service</th>
                <th className="px-6 py-4 text-left">Master Credentials</th>
                <th className="px-6 py-4 text-left">Slots</th>
                <th className="px-6 py-4 text-left">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-bold">N</div>
                    <span className="font-bold text-slate-900">Netflix Premium</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-slate-800 font-mono">admin@stream.com</span>
                    <span className="text-slate-400 font-mono text-xs">********</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">3 / 5 Available</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">$4.99</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button className="text-indigo-600 font-bold hover:text-indigo-800 mr-4">Edit</button>
                  <button className="text-red-600 font-bold hover:text-red-800">Purge</button>
                </td>
              </tr>
              {/* More rows would be mapped here */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
