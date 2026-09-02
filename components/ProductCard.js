"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import { formatVND, priceForTier } from "@/lib/pricing";

export default function ProductCard({ product }) {
  const { tier, addToCart } = useCart();
  const price = priceForTier(product, tier);
  const outOfStock = product.stock <= 0;

  return (
    <div className="group flex flex-col">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] rounded-xl2 overflow-hidden bg-cream-200"
      >
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <PlaceholderBloom />
        )}
        {product.is_bestseller ? (
          <span className="absolute top-3 left-3 bg-clay text-ink text-xs px-2.5 py-1 rounded-full font-medium">
            Bán chạy
          </span>
        ) : null}
        {outOfStock && (
          <span className="absolute inset-0 bg-ink/40 flex items-center justify-center text-cream text-sm font-medium">
            Tạm hết hàng
          </span>
        )}
      </Link>

      <div className="mt-3 flex-1 flex flex-col">
        <p className="text-xs text-mist-600 uppercase tracking-wide mb-1">
          {product.category}
        </p>
        <Link href={`/product/${product.slug}`} className="font-display text-lg leading-snug hover:text-mist-600">
          {product.name}
        </Link>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-medium">{formatVND(price)}</span>
          <button
            type="button"
            disabled={outOfStock}
            onClick={() => addToCart(product, 1)}
            className="text-xs border border-ink rounded-full px-3 py-1.5 hover:bg-ink hover:text-cream transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            Thêm giỏ
          </button>
        </div>
      </div>
    </div>
  );
}

function PlaceholderBloom() {
  return (
    <svg viewBox="0 0 200 250" className="w-full h-full text-mist-200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="250" fill="#EFE6D8" />
      <g transform="translate(100,110)" fill="#C2DAE5">
        <circle r="18" />
        <ellipse rx="14" ry="24" transform="rotate(0) translate(0,-30)" />
        <ellipse rx="14" ry="24" transform="rotate(72) translate(0,-30)" />
        <ellipse rx="14" ry="24" transform="rotate(144) translate(0,-30)" />
        <ellipse rx="14" ry="24" transform="rotate(216) translate(0,-30)" />
        <ellipse rx="14" ry="24" transform="rotate(288) translate(0,-30)" />
      </g>
      <circle cx="100" cy="110" r="7" fill="#D9B8A3" />
    </svg>
  );
}
