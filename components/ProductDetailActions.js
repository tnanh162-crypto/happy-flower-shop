"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { formatVND, priceForTier, tierLabel, PRICE_TIERS } from "@/lib/pricing";

export default function ProductDetailActions({ product }) {
  const { tier, setTier, addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const router = useRouter();
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    addToCart(product, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  function handleBuyNow() {
    addToCart(product, qty);
    router.push("/cart");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-soft mb-2">Bảng giá theo nhóm khách hàng</p>
        <div className="flex flex-wrap gap-2">
          {PRICE_TIERS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTier(t.key)}
              className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
                tier === t.key
                  ? "bg-ink text-cream border-ink"
                  : "border-cream-300 hover:border-mist-400"
              }`}
            >
              {t.label} · {formatVND(priceForTier(product, t.key))}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="font-display text-3xl">{formatVND(priceForTier(product, tier))}</span>
        <span className="text-sm text-ink-soft">giá {tierLabel(tier).toLowerCase()}</span>
      </div>

      {outOfStock ? (
        <p className="text-sm text-clay bg-clay-light inline-block px-3 py-1.5 rounded-full">
          Sản phẩm tạm hết hàng
        </p>
      ) : (
        <p className="text-sm text-ink-soft">Còn {product.stock} sản phẩm</p>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-cream-300 rounded-full">
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center text-lg"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Giảm số lượng"
          >
            −
          </button>
          <span className="w-8 text-center">{qty}</span>
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center text-lg"
            onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
            aria-label="Tăng số lượng"
          >
            +
          </button>
        </div>

        <button
          type="button"
          disabled={outOfStock}
          onClick={handleAdd}
          className="btn-secondary flex-1 disabled:opacity-40 disabled:pointer-events-none"
        >
          {justAdded ? "Đã thêm ✓" : "Thêm vào giỏ"}
        </button>
      </div>

      <button
        type="button"
        disabled={outOfStock}
        onClick={handleBuyNow}
        className="btn-primary w-full disabled:opacity-40 disabled:pointer-events-none"
      >
        Mua ngay
      </button>
    </div>
  );
}
