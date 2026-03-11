import { MasterAccount } from "@/constants/types";
import React, { useState, useMemo } from "react";
import { SearchBar } from "./SearchBar";
import { LogForm } from "./LogForm";
import { INITIAL_FORM } from "@/constants/data";

interface AdminInventoryProps {
  accounts: MasterAccount[];
  isLoading: boolean;
  onRefresh: () => void;
  onAdd: (data: Partial<MasterAccount>) => Promise<void>;
  onUpdate: (id: string, data: Partial<MasterAccount>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const AdminInventory: React.FC<AdminInventoryProps> = ({
  accounts,
  isLoading,
  onRefresh,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] =
    useState<Partial<MasterAccount>>(INITIAL_FORM);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = useMemo(() => {
    return accounts.filter(
      (a) =>
        a.service_name.toLowerCase().includes(search.toLowerCase()) ||
        a.master_email.toLowerCase().includes(search.toLowerCase()) ||
        a.category?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [accounts, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const handleEdit = (acc: MasterAccount) => {
    setFormData(acc);
    setEditingId(acc.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(INITIAL_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await onUpdate(editingId, formData);
    } else {
      await onAdd(formData);
    }
    handleCancel();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const slotFillPct = (acc: MasterAccount) =>
    acc.total_slots > 0
      ? Math.round(
          ((acc.total_slots - acc.available_slots) / acc.total_slots) * 100,
        )
      : 0;

  const totalAvail = accounts.reduce((a, b) => a + b.available_slots, 0);
  const totalOccupied = accounts.reduce(
    (a, b) => a + (b.total_slots - b.available_slots),
    0,
  );

  return (
    <>
      <style>{`
        .inv2 * { box-sizing: border-box; }

        .inv2-add-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 12px; border: none; cursor: pointer;
          font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          transition: all 0.2s;
        }
        .inv2-add-btn.open {
          background: #fef2f2; color: #ef4444;
        }
        .inv2-add-btn.closed {
          background: linear-gradient(135deg,#7c5cfc,#6366f1); color: #fff;
          box-shadow: 0 4px 14px rgba(124,92,252,0.3);
        }
        .inv2-add-btn.closed:hover { box-shadow: 0 6px 20px rgba(124,92,252,0.4); transform: translateY(-1px); }

        .inv2-stat-chip {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px; border-radius: 10px;
          background: #fff; border: 1.5px solid #f0eef9;
        }

        .inv2-th {
          padding: 12px 18px;
          font-family: 'Syne', sans-serif; font-size: 9px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em; color: #b8addb;
          background: #fafafe; border-bottom: 1.5px solid #f0eef9;
          white-space: nowrap;
        }
        .inv2-td { padding: 13px 18px; border-bottom: 1px solid #fafafe; }
        .inv2-tr:hover .inv2-td { background: #fafafe; }
        .inv2-tr:last-child .inv2-td { border-bottom: none; }

        .inv2-action {
          width: 30px; height: 30px; border-radius: 8px; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; transition: all 0.18s;
          background: #f5f3ff; color: #c4b5fd;
        }
        .inv2-action.edit:hover { background: linear-gradient(135deg,#7c5cfc,#6366f1); color: #fff; box-shadow: 0 3px 8px rgba(124,92,252,0.3); }
        .inv2-action.del:hover  { background: #fef2f2; color: #ef4444; }

        /* Pagination */
        .inv2-pagination {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; margin-top: 24px;
        }
        .inv2-page-btn {
          width: 34px; height: 34px; border-radius: 10px; border: 1.5px solid #f0eef9;
          background: #fff; color: #9b8fc2; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
          transition: all 0.2s;
        }
        .inv2-page-btn:hover:not(:disabled) { border-color: #7c5cfc; color: #7c5cfc; }
        .inv2-page-btn.active {
          background: linear-gradient(135deg, #7c5cfc, #6366f1);
          color: #fff; border-color: transparent;
          box-shadow: 0 4px 10px rgba(124,92,252,0.25);
        }
        .inv2-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── Responsive ── */
        .inv2-toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
        .inv2-chips   { display:flex; gap:8px; flex-wrap:wrap; overflow-x:auto; -webkit-overflow-scrolling:touch; }

        @media (max-width: 640px) {
          .inv2-toolbar { flex-direction:column; align-items:stretch; }
          .inv2-add-btn { width:100%; justify-content:center; }
          .inv2-chips   { flex-wrap:nowrap; }
          .inv2-stat-chip { flex-shrink:0; }
        }
      `}</style>

      {showForm && (
        <LogForm
          editingId={editingId}
          formData={formData}
          isLoading={isLoading}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      <div className="inv2 space-y-5 animate-in fade-in duration-300">
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            placeholder="Search logs, emails, categories..."
          />
          <button
            className={`inv2-add-btn ${showForm ? "open" : "closed"}`}
            onClick={() => {
              if (showForm) {
                handleCancel();
              } else {
                setFormData(INITIAL_FORM);
                setEditingId(null);
                setShowForm(true);
              }
            }}
          >
            <i
              className={`fa-solid ${showForm ? "fa-xmark" : "fa-plus"}`}
              style={{ fontSize: 11 }}
            />
            {showForm ? "Close Form" : "Add Listing"}
          </button>
        </div>

        {/* Summary chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            {
              label: "Total Listings",
              value: accounts.length,
              icon: "fa-layer-group",
              color: "#7c5cfc",
            },
            {
              label: "Available Slots",
              value: totalAvail,
              icon: "fa-circle-check",
              color: "#10b981",
            },
            {
              label: "Occupied Slots",
              value: totalOccupied,
              icon: "fa-users",
              color: "#f59e0b",
            },
          ].map((s) => (
            <div key={s.label} className="inv2-stat-chip">
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "#f5f3ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className={`fa-solid ${s.icon}`}
                  style={{ color: s.color, fontSize: 11 }}
                />
              </div>
              <div>
                <span
                  className="font-display"
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#1a1230",
                    display: "block",
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </span>
                <span
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.07em",
                    color: "#c4b5fd",
                  }}
                >
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div
          style={{
            background: "#fff",
            border: "1.5px solid #f0eef9",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "Service",
                    "Type",
                    "Credentials",
                    "Occupancy",
                    "Price",
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={h}
                      className="inv2-th"
                      style={{ textAlign: i >= 4 ? "right" : "left" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedAccounts.map((acc) => {
                  const pct = slotFillPct(acc);
                  const full = acc.available_slots === 0;
                  const barColor =
                    pct >= 100 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#10b981";
                  return (
                    <tr
                      key={acc.id}
                      className="inv2-tr"
                      style={{ transition: "background 0.15s" }}
                    >
                      {/* Service */}
                      <td className="inv2-td">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: "50%",
                                overflow: "hidden",
                                border: "2px solid #ede9fe",
                              }}
                            >
                              <img
                                src={acc.icon_url}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                                alt=""
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    `https://ui-avatars.com/api/?name=${acc.service_name}&background=ede9fe&color=7c5cfc&size=38`;
                                }}
                              />
                            </div>
                            {full && (
                              <span
                                style={{
                                  position: "absolute",
                                  top: -2,
                                  right: -2,
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  background: "#ef4444",
                                  border: "2px solid #fff",
                                }}
                              />
                            )}
                          </div>
                          <div>
                            <span
                              className="font-display"
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#1a1230",
                                display: "block",
                              }}
                            >
                              {acc.service_name}
                            </span>
                            <span
                              style={{
                                fontFamily: "'Syne',sans-serif",
                                fontSize: 9,
                                fontWeight: 700,
                                textTransform: "uppercase" as const,
                                letterSpacing: "0.07em",
                                color: "#c4b5fd",
                              }}
                            >
                              {acc.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      {/* Type */}
                      <td className="inv2-td">
                        <span
                          style={{
                            padding: "3px 9px",
                            borderRadius: 7,
                            background: "#f5f3ff",
                            fontFamily: "'Syne',sans-serif",
                            fontSize: 9,
                            fontWeight: 700,
                            textTransform: "uppercase" as const,
                            letterSpacing: "0.06em",
                            color: "#7c5cfc",
                            whiteSpace: "nowrap" as const,
                          }}
                        >
                          {acc.fulfillment_type || "Password"}
                        </span>
                      </td>
                      {/* Credentials */}
                      <td className="inv2-td" style={{ maxWidth: 180 }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#475569",
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap" as const,
                          }}
                        >
                          {acc.master_email}
                        </span>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: 10,
                            color: "#d8d0f8",
                            letterSpacing: "0.1em",
                          }}
                        >
                          ••••••••
                        </span>
                      </td>
                      {/* Occupancy */}
                      <td className="inv2-td">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 72,
                              height: 5,
                              borderRadius: 99,
                              background: "#f0eef9",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${pct}%`,
                                background: barColor,
                                borderRadius: 99,
                                transition:
                                  "width 0.6s cubic-bezier(0.34,1,0.64,1)",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontFamily: "'Syne',sans-serif",
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#9b8fc2",
                              whiteSpace: "nowrap" as const,
                            }}
                          >
                            {acc.available_slots}/{acc.total_slots}
                          </span>
                        </div>
                      </td>
                      {/* Price */}
                      <td className="inv2-td" style={{ textAlign: "right" }}>
                        <span
                          className="font-display"
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#1a1230",
                            display: "block",
                          }}
                        >
                          ₦{acc.price.toLocaleString()}
                        </span>
                        {acc.original_price > acc.price && (
                          <span
                            style={{
                              fontSize: 10,
                              color: "#d8d0f8",
                              textDecoration: "line-through",
                            }}
                          >
                            ₦{acc.original_price.toLocaleString()}
                          </span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="inv2-td" style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 6,
                          }}
                        >
                          <button
                            className="inv2-action edit"
                            onClick={() => handleEdit(acc)}
                            title="Edit"
                          >
                            <i className="fa-solid fa-pen-to-square" />
                          </button>
                          <button
                            className="inv2-action del"
                            onClick={() => onDelete(acc.id)}
                            title="Delete"
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ padding: "56px", textAlign: "center" }}
                    >
                      <i
                        className="fa-solid fa-box-open"
                        style={{
                          fontSize: 32,
                          color: "#ede9fe",
                          display: "block",
                          marginBottom: 12,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'Syne',sans-serif",
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.08em",
                          color: "#c4b5fd",
                        }}
                      >
                        No listings found
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="inv2-pagination pb-6">
              <button
                className="inv2-page-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <i className="fa-solid fa-chevron-left" />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`inv2-page-btn ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="inv2-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <i className="fa-solid fa-chevron-right" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
