"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { formatVND, priceForTier, tierLabel } from "@/lib/pricing";
import TierSwitcher from "@/components/TierSwitcher";

export default function CartPage() {
  const { items, tier, updateQuantity, removeFromCart, subtotal, hydrated } = useCart();

  if (hydrated && items.length === 0) {
    return (
      <div className="container-shop py-20 text-center">
        <h1 className="font-display text-3xl mb-3">Giỏ hàng trống</h1>
        <p className="text-ink-soft mb-8">Hãy chọn một vài bó hoa yêu thích để bắt đầu.</p>
        <Link href="/" className="btn-primary">Khám phá sản phẩm</Link>
      </div>
    );
  }

  return (
    <div className="container-shop py-10">
      <h1 className="font-display text-3xl mb-2">Giỏ hàng của bạn</h1>
      <p className="text-sm text-ink-soft mb-8">
        Đang xem giá theo nhóm: <span className="font-medium text-ink">{tierLabel(tier)}</span>{" "}
        · <TierSwitcherInline />
      </p>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 bg-white border border-cream-300 rounded-xl2 p-4"
            >
              <div className="w-20 h-20 rounded-xl bg-cream-200 overflow-hidden shrink-0">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-sm text-ink-soft">{formatVND(priceForTier(item, tier))} / sản phẩm</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center border border-cream-300 rounded-full">
                    <button
                      className="w-7 h-7 flex items-center justify-center"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      aria-label="Giảm số lượng"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      className="w-7 h-7 flex items-center justify-center"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-xs text-ink-soft hover:text-clay underline"
                  >
                    Xóa
                  </button>
                </div>
              </div>
              <div className="text-right font-medium">
                {formatVND(priceForTier(item, tier) * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-mist-50 border border-mist-200 rounded-xl2 p-6 h-fit">
          <h2 className="font-display text-xl mb-4">Tổng cộng</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-ink-soft">Tạm tính</span>
            <span>{formatVND(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-ink-soft">Phí giao hàng</span>
            <span>Tính khi xác nhận</span>
          </div>
          <div className="flex justify-between font-medium text-lg border-t border-mist-200 pt-4 mb-6">
            <span>Thành tiền</span>
            <span>{formatVND(subtotal)}</span>
          </div>
          <Link href="/checkout" className="btn-primary w-full">
            Tiến hành đặt hàng
          </Link>
        </div>
      </div>
    </div>
  );
}

function TierSwitcherInline() {
  return (
    <span className="inline-block align-middle">
      <TierSwitcher compact />
    </span>
  );
}
