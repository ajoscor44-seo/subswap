import React from "react";

const Divider: React.FC = () => (
  <div className="flex items-center gap-3 my-2">
    <div className="flex-1 h-px bg-slate-100" />
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
      or
    </span>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

export default Divider;
