import React, { useState, useEffect, useMemo } from "react";
import { ProductCategory, User, MasterAccount } from "@/constants/types";
import { supabase } from "../lib/supabase";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";

interface Toast {
  message: string;
  type: "success" | "error";
}

interface MarketplaceProps {
  user: User | null;
  onAuthRequired: () => void;
  onPurchaseSuccess?: () => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  user,
  onAuthRequired,
  onPurchaseSuccess,
}) => {
  const [dbProducts, setDbProducts] = useState<MasterAccount[]>([]);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  // Quick Fund State
  const [showFundModal, setShowFundModal] = useState(false);
  const [neededAmount, setNeededAmount] = useState(0);
  const [activeAccount, setActiveAccount] = useState<MasterAccount | null>(
    null,
  );

  const fwConfig = {
    public_key:
      import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY ||
      "FLWPUBK_TEST-1ee9d1185c08b3332a2192bcf4702b37-X",
    tx_ref: Date.now().toString(),
    amount: neededAmount,
    currency: "NGN",
    payment_options: "card,mobilemoney,ussd",
    customer: {
      email: user?.email || "",
      phone_number: "",
      name: user?.name || user?.username || "",
    },
    customizations: {
      title: "DiscountZAR Wallet Top-up",
      description: `Quick Fund for ${activeAccount?.service_name || "Marketplace"}`,
      logo: "https://ui-avatars.com/api/?name=DiscountZAR&background=6366f1&color=fff",
    },
  };

  const handleFlutterPayment = useFlutterwave(fwConfig);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("master_accounts")
        .select(
          `
          *,
          owner:profiles!owner_id (
            username,
            is_verified,
            avatar,
            merchant_rating
          )
        `,
        )
        .gt("available_slots", 0)
        .order("created_at", { ascending: false });

      if (data) setDbProducts(data as MasterAccount[]);
      if (error) throw error;
    } catch (err) {
      console.error("Error fetching marketplace:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (account: MasterAccount) => {
    if (!user) {
      onAuthRequired();
      return;
    }

    if (user.balance < account.price) {
      setNeededAmount(account.price - user.balance);
      setActiveAccount(account);
      setShowFundModal(true);
      return;
    }

    setIsProcessing(account.id);
    try {
      const { error } = await supabase.rpc("purchase_slot_v2", {
        p_buyer_id: user.id,
        p_account_id: account.id,
        p_profile_name: user.username || user.name,
        p_amount: account.price,
      });

      if (error) throw error;

      showToast(`Success! Taking you to your new stack...`);

      // Call parent success handler for smooth internal navigation
      if (onPurchaseSuccess) {
        setTimeout(() => onPurchaseSuccess(), 1500);
      }
    } catch (err: any) {
      showToast(err.message || "Purchase failed. Please try again.", "error");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleFlutterwavePayment = (amount: number) => {
    if (!user) return;

    const config = {
      ...fwConfig,
      amount: amount,
      tx_ref: `tx-qf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customizations: {
        ...fwConfig.customizations,
        description: `Quick Fund for ${activeAccount?.service_name || "Marketplace"}`,
      },
    };

    handleFlutterPayment({
      ...config,
      callback: async (response) => {
        if (response.status === "successful") {
          try {
            const { error: txError } = await supabase
              .from("transactions")
              .insert({
                user_id: user.id,
                amount: amount,
                type: "Deposit",
                description: `Quick Fund for ${activeAccount?.service_name || "Marketplace"}`,
              });
            if (txError) throw txError;

            const { error: balError } = await supabase
              .from("profiles")
              .update({
                balance: user.balance + amount,
              })
              .eq("id", user.id);
            if (balError) throw balError;

            showToast(`₦${amount.toLocaleString()} added successfully!`);
            setShowFundModal(false);

            // If we now have enough, proceed to join
            if (activeAccount && user.balance + amount >= activeAccount.price) {
              handleJoin(activeAccount);
            } else {
              if (onPurchaseSuccess) onPurchaseSuccess();
            }
          } catch (err: any) {
            showToast(err.message, "error");
          }
        } else {
          showToast("Payment was not successful", "error");
        }
        closePaymentModal();
      },
      onClose: () => {
        console.log("Payment modal closed");
      },
    });
  };

  const filteredProducts = useMemo(() => {
    return dbProducts.filter((p) => {
      const matchesFilter = filter === "All" || p.category === filter;
      const matchesSearch = p.service_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery, dbProducts]);

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-24 right-6 z-300 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-4 border ${
            toast.type === "success"
              ? "bg-slate-900 border-slate-700 text-white"
              : "bg-red-500 border-red-400 text-white"
          }`}
        >
          <i
            className={`fa-solid ${toast.type === "success" ? "fa-circle-check text-emerald-400" : "fa-triangle-exclamation"}`}
          ></i>
          <p className="font-black text-[10px] uppercase tracking-widest">
            {toast.message}
          </p>
        </div>
      )}

      {/* Quick Fund Modal */}
      {showFundModal && (
        <div className="fixed inset-0 z-250 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-4xl md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl animate-in zoom-in-95 relative border border-slate-100">
            <button
              onClick={() => setShowFundModal(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            <div className="text-center mb-6 md:mb-8">
              <div className="h-12 w-12 md:h-16 md:w-16 bg-amber-50 text-amber-500 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl mx-auto mb-4">
                <i className="fa-solid fa-wallet"></i>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Top-up Required
              </h3>
              <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">
                You need ₦{neededAmount.toLocaleString()} more to join this
                plan.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-slate-100">
              <div className="flex justify-between text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                <span>Plan Price</span>
                <span className="text-slate-900">
                  ₦{activeAccount?.price.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3 md:mb-4">
                <div
                  className="h-full bg-indigo-600 transition-all duration-700"
                  style={{
                    width: `${Math.min(100, ((user?.balance || 0) / (activeAccount?.price || 1)) * 100)}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] md:text-xs font-black">
                <span className="text-slate-400">
                  Balance: ₦{user?.balance.toLocaleString()}
                </span>
                <span className="text-indigo-600">
                  Missing: ₦{neededAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleFlutterwavePayment(neededAmount)}
                disabled={isProcessing === "funding"}
                className="w-full bg-indigo-600 text-white py-3.5 md:py-4 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95"
              >
                {isProcessing === "funding" ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-bolt"></i>
                )}
                Pay ₦{neededAmount.toLocaleString()} via Flutterwave
              </button>

              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {[2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleFlutterwavePayment(amt)}
                    className="py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest text-slate-900 hover:border-indigo-600 transition-all active:scale-95"
                  >
                    +₦{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[8px] md:text-[9px] text-center text-slate-400 mt-6 font-bold uppercase tracking-widest">
              Secured by Flutterwave
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="relative w-full max-w-2xl mx-auto">
          <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            placeholder="Search for Netflix, Spotify, Canva..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 p-5 pl-14 rounded-3xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="flex justify-center gap-2 p-1 overflow-x-auto no-scrollbar pb-2">
          {[
            "All",
            ProductCategory.STREAMING,
            ProductCategory.SOFTWARE,
            ProductCategory.MUSIC,
            ProductCategory.EDUCATION,
          ].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${filter === f ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 border-2 border-slate-50 animate-pulse"
            >
              <div className="h-24 md:h-48 bg-slate-100 rounded-xl md:rounded-2xl mb-4 md:mb-6"></div>
              <div className="h-4 bg-slate-100 rounded-full w-2/3 mb-2 md:mb-4"></div>
              <div className="h-3 bg-slate-100 rounded-full w-full mb-4 md:mb-8"></div>
              <div className="h-8 md:h-12 bg-slate-100 rounded-lg md:rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          {filteredProducts.map((account) => (
            <div
              key={account.id}
              className="bg-white rounded-2xl md:rounded-[2.5rem] border-2 border-slate-50 overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
            >
              <div className="h-32 md:h-56 relative overflow-hidden">
                <img
                  src={account.icon_url}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  alt={account.service_name}
                />
                <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-white/95 backdrop-blur px-2 md:px-4 py-1.5 md:py-2.5 rounded-lg md:rounded-2xl shadow-xl border border-slate-100">
                  <p className="text-xs md:text-xl font-black text-slate-900 leading-none">
                    ₦{account.price.toLocaleString()}
                  </p>
                  <p className="text-[6px] md:text-[8px] font-black uppercase tracking-widest text-slate-400 mt-0.5 md:mt-1">
                    / Month
                  </p>
                </div>
              </div>

              <div className="p-3 md:p-8 flex flex-col grow">
                <div className="grow space-y-3 md:space-y-6">
                  <div>
                    <h3 className="text-xs md:text-xl font-black text-slate-900 mb-1 md:mb-2 truncate">
                      {account.service_name}
                    </h3>
                    <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-4">
                      <span className="bg-indigo-50 text-indigo-600 px-1.5 md:px-3 py-0.5 md:py-1 rounded-md md:rounded-lg font-black text-[6px] md:text-[9px] uppercase tracking-widest">
                        {account.category}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center justify-between text-[6px] md:text-[9px] font-black uppercase tracking-widest">
                      <span className="text-slate-400">Slots</span>
                      <span className="text-indigo-600">
                        {account.available_slots} left
                      </span>
                    </div>
                    <div className="h-1.5 md:h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                        style={{
                          width: `${((account.total_slots - account.available_slots) / account.total_slots) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button
                  disabled={isProcessing === account.id}
                  onClick={() => handleJoin(account)}
                  className={`w-full mt-4 md:mt-8 py-2.5 md:py-4.5 rounded-xl md:rounded-3xl font-black uppercase tracking-widest md:tracking-[0.2em] text-[8px] md:text-[10px] transition-all shadow-xl active:scale-95 disabled:opacity-50 ${
                    user && user.balance < account.price
                      ? "bg-amber-500 text-white hover:bg-amber-600"
                      : "bg-slate-900 text-white hover:bg-indigo-600"
                  }`}
                >
                  {isProcessing === account.id ? (
                    <i className="fa-solid fa-spinner fa-spin mr-1 md:mr-2"></i>
                  ) : null}
                  {user && user.balance < account.price ? "Fund" : `Join`}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4 text-xl">
            <i className="fa-solid fa-magnifying-glass"></i>
          </div>
          <p className="text-slate-400 font-black text-sm uppercase tracking-widest">
            No active slots found
          </p>
        </div>
      )}
    </div>
  );
};
