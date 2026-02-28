import React, { useState } from "react";

const FaqItem: React.FC<{ question: string; answer: string }> = ({
  question,
  answer,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
          {question}
        </span>
        <div
          className={`h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center transition-all ${isOpen ? "bg-indigo-600 border-indigo-600 text-white rotate-180" : "text-slate-400"}`}
        >
          <i className="fa-solid fa-chevron-down text-[10px]"></i>
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ${isOpen ? "max-h-96 pb-8" : "max-h-0"}`}
      >
        <p className="text-slate-500 font-medium leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

export const Faq: React.FC = () => {
  const faqs = [
    {
      question: "Is sharing subscriptions legal?",
      answer:
        "DiscountZAR operates within the family sharing terms provided by most major services. We facilitate the secure cost-sharing between individuals, ensuring compliance with platform-specific guidelines where applicable.",
    },
    {
      question: "What happens if a subscription stops working?",
      answer:
        "We have an automated health check system. If a slot becomes inactive, we immediately investigate. Users are protected by our refund policy and owners are penalized for any downtime.",
    },
    {
      question: "How do I get my access credentials?",
      answer:
        "Once you purchase a slot, navigate to the 'My Stacks' tab in your dashboard. Your private profile credentials and login instructions will be available there instantly.",
    },
    {
      question: "Can I cancel my slot at any time?",
      answer:
        "Yes! Most of our subscriptions are renewable monthly. You can choose not to renew for the next month at any time from your dashboard.",
    },
  ];

  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">
            F.A.Q
          </h2>
          <h3 className="text-4xl font-black text-slate-900 tracking-tight">
            Common Questions
          </h3>
        </div>

        <div className="bg-slate-50/50 rounded-[3rem] p-10 md:p-16 border border-slate-100">
          {faqs.map((faq, i) => (
            <FaqItem key={i} {...faq} />
          ))}
        </div>
      </div>
    </section>
  );
};
