"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { formatVND, priceForTier, tierLabel, PRICE_TIERS } from "@/lib/pricing";

export default function CheckoutPage() {
  const { items, tier, setTier, subtotal, clearCart, hydrated } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ customer_name: "", phone: "", address: "", note: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (hydrated && items.length === 0) {
    return (
      <div className="container-shop py-20 text-center">
        <h1 className="font-display text-3xl mb-3">Giỏ hàng trống</h1>
        <p className="text-ink-soft mb-8">Thêm sản phẩm vào giỏ trước khi đặt hàng.</p>
        <Link href="/" className="btn-primary">Về trang chủ</Link>
      </div>
    );
  }

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price_tier: tier,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đặt hàng không thành công. Vui lòng thử lại.");
        setSubmitting(false);
        return;
      }
      clearCart();
      router.push(`/order-confirmation/${data.order.id}`);
    } catch {
      setError("Có lỗi xảy ra. Vui lòng kiểm tra kết nối và thử lại.");
      setSubmitting(false);
    }
  }

  return (
    <div className="container-shop py-10">
      <h1 className="font-display text-3xl mb-8">Thông tin đặt hàng</h1>

      <div className="grid lg:grid-cols-3 gap-10">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          <div>
            <label className="block text-sm mb-1.5" htmlFor="customer_name">Họ và tên</label>
            <input
              id="customer_name"
              required
              value={form.customer_name}
              onChange={(e) => updateField("customer_name", e.target.value)}
              className="w-full border border-cream-300 rounded-lg px-4 py-2.5 bg-white focus:border-mist-400 outline-none"
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5" htmlFor="phone">Số điện thoại</label>
            <input
              id="phone"
              required
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="w-full border border-cream-300 rounded-lg px-4 py-2.5 bg-white focus:border-mist-400 outline-none"
              placeholder="09xxxxxxxx"
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5" htmlFor="address">Địa chỉ giao hàng</label>
            <textarea
              id="address"
              required
              rows={3}
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              className="w-full border border-cream-300 rounded-lg px-4 py-2.5 bg-white focus:border-mist-400 outline-none"
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5" htmlFor="note">Ghi chú (tuỳ chọn)</label>
            <textarea
              id="note"
              rows={2}
              value={form.note}
              onChange={(e) => updateField("note", e.target.value)}
              className="w-full border border-cream-300 rounded-lg px-4 py-2.5 bg-white focus:border-mist-400 outline-none"
              placeholder="Thiệp chúc mừng, giờ giao mong muốn..."
            />
          </div>

          <div>
            <p className="text-sm mb-1.5">Nhóm khách hàng</p>
            <div className="flex flex-wrap gap-2">
              {PRICE_TIERS.map((t) => (
                <button
                  type="button"
                  key={t.key}
                  onClick={() => setTier(t.key)}
                  className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
                    tier === t.key ? "bg-ink text-cream border-ink" : "border-cream-300 hover:border-mist-400"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-white bg-clay/90 rounded-lg px-4 py-2.5">{error}</p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50">
            {submitting ? "Đang xử lý..." : `Xác nhận đặt hàng · ${formatVND(subtotal)}`}
          </button>
        </form>

        <aside className="bg-mist-50 border border-mist-200 rounded-xl2 p-6 h-fit space-y-3">
          <h2 className="font-display text-xl mb-2">Đơn hàng ({tierLabel(tier)})</h2>
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span className="text-ink-soft">{item.name} × {item.quantity}</span>
              <span>{formatVND(priceForTier(item, tier) * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between font-medium text-lg border-t border-mist-200 pt-4">
            <span>Thành tiền</span>
            <span>{formatVND(subtotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
