"use client";

import { useCart } from "./CartContext";
import { PRICE_TIERS } from "@/lib/pricing";

export default function TierSwitcher({ compact = false }) {
  const { tier, setTier } = useCart();

  return (
    <label className={compact ? "block" : "flex items-center gap-2"}>
      {!compact && (
        <span className="text-xs uppercase tracking-wide text-ink-soft whitespace-nowrap">
          Bảng giá
        </span>
      )}
      <select
        value={tier}
        onChange={(e) => setTier(e.target.value)}
        className="text-sm bg-cream-200 border border-cream-300 rounded-full px-3 py-1.5 focus:border-mist-400 cursor-pointer"
        aria-label="Chọn nhóm khách hàng để xem giá phù hợp"
      >
        {PRICE_TIERS.map((t) => (
          <option key={t.key} value={t.key}>
            {t.label}
          </option>
        ))}
      </select>
    </label>
  );
}
