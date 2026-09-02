import Link from "next/link";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import { formatVND, tierLabel } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const STATUS_LABEL = {
  pending: "Chờ xác nhận",
  delivering: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã huỷ",
};

export default function OrderConfirmationPage({ params }) {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(Number(params.id));
  if (!order) notFound();
  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);

  return (
    <div className="container-shop py-16 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-full bg-sage/20 text-sage flex items-center justify-center mx-auto mb-4">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-display text-3xl mb-2">Cảm ơn bạn đã đặt hoa!</h1>
        <p className="text-ink-soft">
          Mã đơn hàng <span className="font-medium text-ink">#{order.id}</span> · Trạng thái:{" "}
          <span className="font-medium text-ink">{STATUS_LABEL[order.status]}</span>
        </p>
      </div>

      <div className="bg-white border border-cream-300 rounded-xl2 p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-ink-soft">Người nhận</p>
            <p className="font-medium">{order.customer_name}</p>
          </div>
          <div>
            <p className="text-ink-soft">Số điện thoại</p>
            <p className="font-medium">{order.phone}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-ink-soft">Địa chỉ giao hàng</p>
            <p className="font-medium">{order.address}</p>
          </div>
          <div>
            <p className="text-ink-soft">Bảng giá áp dụng</p>
            <p className="font-medium">{tierLabel(order.price_tier)}</p>
          </div>
        </div>

        <div className="border-t border-cream-300 pt-4 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-ink-soft">{item.product_name} × {item.quantity}</span>
              <span>{formatVND(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between font-medium text-lg border-t border-cream-300 pt-4">
          <span>Tổng cộng</span>
          <span>{formatVND(order.total)}</span>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link href="/" className="btn-primary">Tiếp tục mua sắm</Link>
      </div>
    </div>
  );
}
