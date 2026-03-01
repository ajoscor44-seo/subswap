import React, { useState } from "react";
// Fixed: Using User instead of non-existent Profile
import { UserSubscription, User } from "@/constants/types";

// Mock data for purchased subscriptions
const MOCK_SUBSCRIPTIONS: UserSubscription[] = [
  {
    id: "sub-1",
    user_id: "user-123",
    account_id: "1",
    assigned_profile_name: "John_Premium",
    // Fixed: 'active' changed to 'Active' to match UserSubscription type
    status: "Active",
    purchased_at: "2023-10-01T12:00:00Z",
    master_accounts: {
      id: "1",
      service_name: "Netflix Premium 4K",
      master_email: "netflix-master-01@provider.com",
      master_password: "super-secure-netflix-pass-2024",
      total_slots: 5,
      available_slots: 3,
      price: 4.99,
      description: "",
      icon_url: "https://picsum.photos/id/1/200/200",
      // Added missing category property to match MasterAccount interface
      category: "Streaming",
    },
  },
];

const CredentialCard: React.FC<{ sub: UserSubscription }> = ({ sub }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
      <div className="h-16 w-16 bg-slate-100 rounded-xl shrink-0 flex items-center justify-center overflow-hidden">
        <img
          src={sub.master_accounts?.icon_url}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div className="grow min-w-0">
        <h3 className="text-lg font-bold text-slate-900 truncate">
          {sub.master_accounts?.service_name}
        </h3>
        <p className="text-sm text-slate-500">
          Profile Name:{" "}
          <span className="font-semibold text-slate-700">
            {sub.assigned_profile_name}
          </span>
        </p>
      </div>

      <div className="shrink-0 w-full sm:w-auto">
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-800 transition-colors"
          >
            Reveal Credentials
          </button>
        ) : (
          <div className="space-y-2 w-full max-w-xs">
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <span className="text-xs font-bold text-slate-400 uppercase w-12">
                User
              </span>
              <span className="text-sm font-mono text-slate-800 grow truncate">
                {sub.master_accounts?.master_email}
              </span>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    sub.master_accounts?.master_email || "",
                  )
                }
                className="text-indigo-600 hover:text-indigo-800 text-xs font-bold"
              >
                Copy
              </button>
            </div>
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <span className="text-xs font-bold text-slate-400 uppercase w-12">
                Pass
              </span>
              <span className="text-sm font-mono text-slate-800 grow truncate">
                {sub.master_accounts?.master_password}
              </span>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    sub.master_accounts?.master_password || "",
                  )
                }
                className="text-indigo-600 hover:text-indigo-800 text-xs font-bold"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Fixed: Using User instead of Profile
export const UserDashboard: React.FC<{ user: User | null }> = ({ user }) => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          My Access
        </h1>
        <p className="text-slate-500 mt-1">
          Your purchased premium subscription slots and credentials.
        </p>
      </div>

      <div className="space-y-4">
        {MOCK_SUBSCRIPTIONS.length > 0 ? (
          MOCK_SUBSCRIPTIONS.map((sub) => (
            <CredentialCard key={sub.id} sub={sub} />
          ))
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-20 text-center">
            <p className="text-slate-500">No active subscriptions found.</p>
            <button className="mt-4 text-indigo-600 font-bold hover:underline">
              Browse Marketplace
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
