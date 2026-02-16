
import React from 'react';

export const Features: React.FC = () => {
  const features = [
    {
      title: 'Encrypted Security',
      desc: 'We use military-grade encryption to protect your credentials and private profile access.',
      icon: 'fa-shield-halved',
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      title: 'Automated Access',
      desc: 'Get instant access credentials as soon as your payment is confirmed. No waiting.',
      icon: 'fa-bolt',
      color: 'bg-amber-100 text-amber-600'
    },
    {
      title: 'Verified Owners',
      desc: 'Every subscription owner is thoroughly vetted to ensure 100% uptime and reliability.',
      icon: 'fa-user-check',
      color: 'bg-emerald-100 text-emerald-600'
    },
    {
      title: '24/7 Support',
      desc: 'Our dedicated team is always available to help with any access or payment issues.',
      icon: 'fa-headset',
      color: 'bg-rose-100 text-rose-600'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Why SubSwap?</h2>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Designed for secure and <br /> effortless sharing.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-600/20 hover:bg-indigo-50/30 transition-all duration-500">
              <div className={`h-14 w-14 ${f.color} rounded-2xl flex items-center justify-center text-xl mb-6 shadow-sm`}>
                <i className={`fa-solid ${f.icon}`}></i>
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-3">{f.title}</h4>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
