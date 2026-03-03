import React from "react";

const SERVICES = [
  {
    name: "Netflix",
    icon: "fa-brands fa-netflix",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    name: "Spotify",
    icon: "fa-brands fa-spotify",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    name: "Canva",
    icon: "fa-solid fa-paintbrush",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    name: "YouTube",
    icon: "fa-brands fa-youtube",
    color: "text-red-500",
    bg: "bg-rose-50",
  },
  {
    name: "Apple Music",
    icon: "fa-brands fa-apple",
    color: "text-slate-900",
    bg: "bg-slate-100",
  },
  {
    name: "ChatGPT Plus",
    icon: "fa-solid fa-robot",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
];

export const PopularServices: React.FC = () => {
  return (
    <section className="py-20 bg-slate-50 border-y border-slate-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          <div className="max-w-md">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              Support for all your favorites
            </h3>
            <p className="text-slate-500 mt-2 font-medium">
              From entertainment to productivity, we've got the most popular
              services in Nigeria covered.
            </p>
          </div>
          <div className="flex -space-x-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 w-12 rounded-full border-4 border-white bg-indigo-100 overflow-hidden shadow-sm"
              >
                <img src={`https://i.pravatar.cc/150?u=${i + 50}`} alt="user" />
              </div>
            ))}
            <div className="h-12 w-12 rounded-full border-4 border-white bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              +2k
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {SERVICES.map((s, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-4xl border border-slate-200 text-center hover:shadow-xl hover:border-indigo-600/20 transition-all duration-300 group cursor-pointer"
            >
              <div
                className={`h-16 w-16 mx-auto ${s.bg} ${s.color} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}
              >
                <i className={s.icon}></i>
              </div>
              <p className="font-black text-slate-900 tracking-tight">
                {s.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
