
import React from 'react';

const AboutUs: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-6">
            Our Mission is to <span className="text-indigo-600">Democratize Premium.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            SubSwap was born out of a simple observation: digital subscriptions are getting more expensive, yet we often underutilize the slots we pay for.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900">The Problem</h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Family plans for services like Netflix, Spotify, and Canva are designed for sharing, but finding reliable people to share with can be a nightmare. Managing payments, credentials, and access is a full-time job.
            </p>
            <h2 className="text-3xl font-black text-slate-900">Our Solution</h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              SubSwap provides a secure, automated marketplace where subscription owners can sell their unused slots to verified users. We handle the payments, the credential security, and the access management, so you just enjoy the premium experience.
            </p>
          </div>
          <div className="bg-slate-100 rounded-[3rem] p-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/50 rounded-full blur-3xl"></div>
             <div className="relative z-10 space-y-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                   <p className="text-indigo-600 font-black mb-2">Secure Credential Vault</p>
                   <p className="text-slate-500 text-sm">We never expose master passwords. Access is granted through private profiles.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                   <p className="text-indigo-600 font-black mb-2">Automated Payouts</p>
                   <p className="text-slate-500 text-sm">Subscription owners get paid instantly when a slot is purchased.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                   <p className="text-indigo-600 font-black mb-2">Verified Members</p>
                   <p className="text-slate-500 text-sm">Every user on SubSwap is verified to ensure a premium community experience.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Team/Stats Section */}
      <section className="py-24 bg-slate-900 text-white rounded-[3rem] mx-4 mb-24 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
           <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500 blur-[120px] rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
             <div>
                <p className="text-4xl font-black mb-2">12k+</p>
                <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Active Savers</p>
             </div>
             <div>
                <p className="text-4xl font-black mb-2">$240k</p>
                <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Saved Monthly</p>
             </div>
             <div>
                <p className="text-4xl font-black mb-2">45+</p>
                <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Premium Services</p>
             </div>
             <div>
                <p className="text-4xl font-black mb-2">99.9%</p>
                <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Uptime Guarantee</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
