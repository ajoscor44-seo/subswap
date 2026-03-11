import { CATEGORIES, CATEGORY_META, PLATFORMS } from "@/constants/data";
import { Platform, PlatformCategory } from "@/constants/types";
import { supabase } from "@/lib/supabase";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";

const CLIENT_ID = import.meta.env.VITE_BRANDFETCH_CLIENT_ID!;

export const logoUrl = (domain: string, size = 64) => {
  if (!domain) return `https://ui-avatars.com/api/?background=random&color=fff&size=${size}`;
  if (domain.startsWith('http')) return domain;
  return `https://cdn.brandfetch.io/${domain}/w/${size * 2}/h/${size * 2}/fallback/lettermark/type/icon?c=${CLIENT_ID}`;
}

interface BrandLogoProps {
  domain: string;
  name: string;
  size?: number;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  domain,
  name,
  size = 40,
  className = "",
}) => {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");

  const initials = name
    ? name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "??";

  const bg = useMemo(() => {
    let h = 0;
    const str = domain || name || "default";
    for (const c of str) h = (h * 31 + c.charCodeAt(0)) % 360;
    return `hsl(${h},65%,48%)`;
  }, [domain, name]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center text-white font-black"
        style={{ background: bg, fontSize: size * 0.35 }}
      >
        {initials}
      </div>

      <img
        src={logoUrl(domain, size)}
        alt={name}
        className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
        style={{ opacity: state === "loaded" ? 1 : 0 }}
        onLoad={() => setState("loaded")}
        onError={() => setState("error")}
      />

      {state === "loading" && (
        <div className="absolute inset-0 shimmer rounded-xl" />
      )}
    </div>
  );
};

export interface ServicePickerProps {
  value: Platform | null;
  onChange: (platform: Platform) => void;
  isAdmin?: boolean;
}

export const ServicePicker: React.FC<ServicePickerProps> = ({
  value,
  onChange,
  isAdmin = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<PlatformCategory | null>(
    null,
  );
  const [customPlatforms, setCustomPlatforms] = useState<Platform[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchCustomPlatforms = async () => {
    const { data } = await supabase.from("custom_platforms").select("*");
    if (data) setCustomPlatforms(data as Platform[]);
  };

  useEffect(() => {
    fetchCustomPlatforms();
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  const allPlatforms = useMemo(() => [...PLATFORMS, ...customPlatforms], [customPlatforms]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return allPlatforms.filter((p) => {
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.domain.includes(q) ||
        p.hint?.toLowerCase().includes(q);
      const matchCat = !activeCategory || p.category === activeCategory;
      return matchQ && matchCat;
    });
  }, [query, activeCategory, allPlatforms]);

  const grouped = useMemo<Record<string, Platform[]>>(() => {
    if (query) return {};
    const map: Record<string, Platform[]> = {};
    for (const p of filtered) {
      (map[p.category] ??= []).push(p);
    }
    return map;
  }, [filtered, query]);

  const handleSelect = useCallback(
    (p: Platform) => {
      onChange(p);
      setOpen(false);
      setQuery("");
      setActiveCategory(null);
    },
    [onChange],
  );

  const meta = value ? CATEGORY_META[value.category] : null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          w-full flex items-center gap-4 rounded-2xl border-2 text-left transition-all duration-200
          ${
            open
              ? "border-indigo-500 bg-white shadow-xl shadow-indigo-100/60"
              : value
                ? "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md"
                : "border-dashed border-slate-300 bg-slate-50/80 hover:border-indigo-400 hover:bg-white"
          }
        `}
        style={{ padding: "14px 18px" }}
      >
        {value ? (
          <>
            <BrandLogo domain={value.domain} name={value.name} size={44} />
            <div className="flex-1 min-w-0">
              <p className="font-black text-slate-900 text-sm leading-tight truncate">
                {value.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md"
                  style={{ background: meta!.color + "18", color: meta!.color }}
                >
                  <i className={`fa-solid ${meta!.icon} mr-1`} />
                  {value.category}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {value.domain}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 mr-1">
              Change
            </span>
          </>
        ) : (
          <>
            <div className="h-11 w-11 rounded-xl bg-slate-200/80 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-layer-group text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-400 text-sm">
                Select a service platform
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Netflix, Spotify, Canva, SEMrush...
              </p>
            </div>
          </>
        )}
        <i
          className={`fa-solid fa-chevron-down text-slate-400 text-xs shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="
          absolute left-0 right-0 z-200 mt-2
          bg-white rounded-3xl border border-slate-200/80
          shadow-2xl shadow-slate-300/40
          flex flex-col overflow-hidden
          animate-in fade-in slide-in-from-top-2 duration-150
        "
          style={{ maxHeight: 460 }}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
            <i className="fa-solid fa-magnifying-glass text-slate-400 text-sm shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveCategory(null);
              }}
              placeholder="Search platforms..."
              className="flex-1 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none bg-transparent"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            )}
          </div>

          {!query && (
            <div className="flex items-center gap-1.5 px-3 py-2.5 overflow-x-auto no-scrollbar border-b border-slate-100 shrink-0">
              <Pill
                active={!activeCategory}
                label="All"
                color="#4F46E5"
                onClick={() => setActiveCategory(null)}
              />
              {CATEGORIES.map((cat) => (
                <Pill
                  key={cat}
                  active={activeCategory === cat}
                  label={cat}
                  color={CATEGORY_META[cat].color}
                  icon={CATEGORY_META[cat].icon}
                  onClick={() =>
                    setActiveCategory(cat === activeCategory ? null : cat)
                  }
                />
              ))}
            </div>
          )}

          <div className="overflow-y-auto flex-1 p-2">
            {filtered.length === 0 ? (
              <div className="py-14 text-center">
                {isAdmin && query ? (
                  <button
                    type="button"
                    onClick={() => handleSelect({ name: query, domain: '', category: 'Streaming' })}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    Create "{query}" as Custom
                  </button>
                ) : (
                  <>
                    <i className="fa-solid fa-face-thinking text-slate-200 text-4xl mb-3 block" />
                    <p className="text-slate-400 font-bold text-sm">No platforms found</p>
                  </>
                )}
              </div>
            ) : query ? (
              filtered.map((p) => (
                <PlatformItem
                  key={p.domain + p.name}
                  platform={p}
                  selected={value?.name === p.name}
                  onSelect={handleSelect}
                />
              ))
            ) : (
              Object.entries(grouped).map(([cat, platforms]) => (
                <div key={cat} className="mb-1">
                  <div className="flex items-center gap-2 px-3 pt-3 pb-1.5">
                    <i
                      className={`fa-solid ${CATEGORY_META[cat as PlatformCategory].icon} text-[9px]`}
                      style={{
                        color: CATEGORY_META[cat as PlatformCategory].color,
                      }}
                    />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                      {cat}
                    </span>
                  </div>
                  {(platforms as Platform[]).map((p) => (
                    <PlatformItem
                      key={p.domain + p.name}
                      platform={p}
                      selected={value?.name === p.name}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between shrink-0">
            <span className="text-[10px] text-slate-400 font-medium">
              {filtered.length} platform{filtered.length !== 1 ? "s" : ""}
            </span>
            <span className="text-[10px] text-slate-300 font-bold tracking-wide">
              Logos by Brandfetch
            </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease infinite;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const PlatformItem: React.FC<{
  platform: Platform;
  selected: boolean;
  onSelect: (p: Platform) => void;
}> = ({ platform, selected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(platform)}
    className={`
      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-100 text-left group
      ${
        selected
          ? "bg-indigo-50 border border-indigo-100"
          : "hover:bg-slate-50 border border-transparent"
      }
    `}
  >
    <BrandLogo domain={platform.domain} name={platform.name} size={36} />

    <div className="flex-1 min-w-0">
      <p
        className={`text-sm font-black truncate ${selected ? "text-indigo-700" : "text-slate-900"}`}
      >
        {platform.name}
      </p>
      {platform.hint && (
        <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
          {platform.hint}
        </p>
      )}
    </div>

    {selected ? (
      <span className="h-5 w-5 bg-indigo-600 rounded-full flex items-center justify-center shrink-0">
        <i className="fa-solid fa-check text-white" style={{ fontSize: 9 }} />
      </span>
    ) : (
      <i className="fa-solid fa-chevron-right text-slate-200 text-[10px] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    )}
  </button>
);

const Pill: React.FC<{
  label: string;
  active: boolean;
  color: string;
  icon?: string;
  onClick: () => void;
}> = ({ label, active, color, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-150 shrink-0"
    style={
      active
        ? { background: color, color: "#fff" }
        : { background: color + "12", color: color }
    }
  >
    {icon && <i className={`fa-solid ${icon}`} style={{ fontSize: 8 }} />}
    {label}
  </button>
);
