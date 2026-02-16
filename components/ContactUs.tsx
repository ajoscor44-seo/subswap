
import React, { useState } from 'react';

const ContactUs: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-white py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-8">Get in Touch</h1>
            <p className="text-xl text-slate-500 mb-12 leading-relaxed">
              Have questions about how sharing works? Or need help with your access? Our support team is here for you 24/7.
            </p>

            <div className="space-y-8">
               <div className="flex items-center gap-6">
                  <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-sm">
                     <i className="fa-solid fa-envelope"></i>
                  </div>
                  <div>
                     <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Email Support</p>
                     <p className="text-lg font-bold text-slate-900">support@subswap.com</p>
                  </div>
               </div>
               <div className="flex items-center gap-6">
                  <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-sm">
                     <i className="fa-brands fa-whatsapp"></i>
                  </div>
                  <div>
                     <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">WhatsApp Chat</p>
                     <p className="text-lg font-bold text-slate-900">+234 812 345 6789</p>
                  </div>
               </div>
               <div className="flex items-center gap-6">
                  <div className="h-14 w-14 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center text-xl shadow-sm">
                     <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <div>
                     <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Main Office</p>
                     <p className="text-lg font-bold text-slate-900">Lekki Phase 1, Lagos, Nigeria</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-[3rem] p-10 lg:p-14 border border-slate-200">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95">
                 <div className="h-20 w-20 bg-emerald-500 text-white rounded-full flex items-center justify-center text-3xl shadow-xl shadow-emerald-100">
                    <i className="fa-solid fa-check"></i>
                 </div>
                 <h2 className="text-2xl font-black text-slate-900">Message Sent!</h2>
                 <p className="text-slate-500">We've received your inquiry and will get back to you within 2 hours.</p>
                 <button onClick={() => setSubmitted(false)} className="text-indigo-600 font-bold hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                  <input type="text" required className="w-full bg-white border border-slate-200 p-4 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                  <input type="email" required className="w-full bg-white border border-slate-200 p-4 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</label>
                  <select className="w-full bg-white border border-slate-200 p-4 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none">
                    <option>General Inquiry</option>
                    <option>Subscription Help</option>
                    <option>Payment Issue</option>
                    <option>Become an Owner</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message</label>
                  <textarea required className="w-full bg-white border border-slate-200 p-4 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-32"></textarea>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
