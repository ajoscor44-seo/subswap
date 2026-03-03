import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BrandResult {
  brandId: string;
  claimed: boolean;
  domain: string;
  name: string;
  icon: string | null; // small icon/symbol URL
  logo: string | null; // horizontal logo URL
}

interface BrandPickerProps {
  value: string; // current icon_url
  serviceName: string; // keep in sync with service_name field
  onChange: (iconUrl: string, serviceName: string, domain: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BRANDFETCH_KEY = import.meta.env.VITE_BRANDFETCH_API_KEY;

// Prefer icon (square symbol) for thumbnail; fall back to logo or CDN URL
const extractAssets = (
  logos: any[],
): { icon: string | null; logo: string | null } => {
  let icon: string | null = null;
  let logo: string | null = null;

  for (const l of logos ?? []) {
    const pngFormat = l.formats?.find(
      (f: any) => f.format === "png" && f.background === "transparent",
    );
    const anyFormat = l.formats?.[0];
    const url = pngFormat?.src ?? anyFormat?.src ?? null;

    if (!url) continue;

    if (l.type === "icon" || l.type === "symbol") {
      if (!icon) icon = url;
    } else if (l.type === "logo") {
      if (!logo) logo = url;
    }
  }

  return { icon, logo };
};

// Debounce helper
const useDebouncedValue = (value: string, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

// ─── Component ────────────────────────────────────────────────────────────────

export const BrandPicker: React.FC<BrandPickerProps> = ({
  value,
  serviceName,
  onChange,
}) => {
  const [query, setQuery] = useState(serviceName || "");
  const [results, setResults] = useState<BrandResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<BrandResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebouncedValue(query, 450);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Search brands
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.brandfetch.io/v2/search?q=${encodeURIComponent(debouncedQuery)}`,
          {
            headers: {
              Authorization: `Bearer ${BRANDFETCH_KEY}`,
            },
          },
        );

        if (!res.ok) throw new Error(`Search failed: ${res.status}`);
        const data = await res.json();

        const mapped: BrandResult[] = (data ?? [])
          .slice(0, 8)
          .map((item: any) => {
            const { icon, logo } = extractAssets(item.logos ?? []);
            return {
              brandId: item.brandId,
              claimed: item.claimed,
              domain: item.domain,
              name: item.name,
              icon,
              logo,
            };
          });

        setResults(mapped);
        setOpen(true);
      } catch (err: any) {
        setError("Brand search unavailable. Enter an image URL manually.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const handleSelect = (brand: BrandResult) => {
    setSelected(brand);
    setQuery(brand.name);
    setOpen(false);

    // Prefer icon URL for the square thumbnail, fall back to logo
    const iconUrl =
      brand.icon ||
      brand.logo ||
      `https://cdn.brandfetch.io/${brand.domain}/w/200/h/200`;

    onChange(iconUrl, brand.name, brand.domain);
  };

  const handleManualUrl = (url: string) => {
    onChange(url, query, "");
  };

  return (
    <div className="space-y-3">
      <div ref={containerRef} className="relative">
        {/* Search input */}
        <div
          className={`flex items-center gap-3 bg-slate-50 border-2 rounded-xl px-4 py-3 transition-all ${
            open ? "border-indigo-500 bg-white" : "border-slate-100"
          }`}
        >
          {/* Preview of selected */}
          {selected ? (
            <img
              src={selected.icon || selected.logo || ""}
              className="h-7 w-7 rounded-lg object-contain bg-white border border-slate-100 shrink-0"
              alt=""
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <i className="fa-solid fa-magnifying-glass text-slate-400 shrink-0 text-sm" />
          )}

          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Search for a brand (e.g. Netflix, Spotify...)"
            className="flex-1 bg-transparent font-bold text-sm text-slate-800 placeholder-slate-400 outline-none"
          />

          {loading && (
            <i className="fa-solid fa-spinner fa-spin text-indigo-500 text-sm shrink-0" />
          )}
          {selected && !loading && (
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setQuery("");
                setResults([]);
              }}
              className="text-slate-300 hover:text-red-400 transition-colors"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {open && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
            {results.map((brand) => (
              <button
                key={brand.brandId}
                type="button"
                onClick={() => handleSelect(brand)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-left"
              >
                {/* Brand icon */}
                <div className="h-9 w-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                  {brand.icon || brand.logo ? (
                    <img
                      src={brand.icon || brand.logo || ""}
                      className="h-7 w-7 object-contain"
                      alt=""
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-xs font-black text-slate-400">
                      {brand.name[0]}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">
                    {brand.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">
                    {brand.domain}
                  </p>
                </div>

                {brand.claimed && (
                  <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-widest shrink-0">
                    Official
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1.5">
          <i className="fa-solid fa-triangle-exclamation" />
          {error}
        </p>
      )}

      {/* Selected brand preview + logo selection */}
      {selected && (selected.icon || selected.logo) && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Choose logo style
          </p>
          <div className="flex gap-3 flex-wrap">
            {[
              { url: selected.icon, label: "Icon / Symbol", square: true },
              { url: selected.logo, label: "Horizontal Logo", square: false },
            ]
              .filter((o) => o.url)
              .map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() =>
                    onChange(opt.url!, selected.name, selected.domain)
                  }
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    value === opt.url
                      ? "border-indigo-600 bg-white shadow-md"
                      : "border-transparent bg-white hover:border-slate-200"
                  }`}
                >
                  <img
                    src={opt.url!}
                    className={`object-contain ${opt.square ? "h-10 w-10" : "h-8 w-24"}`}
                    alt={opt.label}
                  />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    {opt.label}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Manual URL fallback */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          or use custom URL
        </span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>

      <input
        type="text"
        placeholder="Paste image URL directly..."
        className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
        value={!selected ? value : ""}
        onChange={(e) => {
          setSelected(null);
          handleManualUrl(e.target.value);
        }}
      />

      {/* Current preview */}
      {value && (
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <img
            src={value}
            className="h-10 w-10 rounded-xl object-contain bg-white border border-slate-100"
            alt="Current icon"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Current icon
            </p>
            <p className="text-[10px] text-slate-300 font-mono truncate">
              {value}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
