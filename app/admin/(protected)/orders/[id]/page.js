import Link from "next/link";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import { formatVND, tierLabel } from "@/lib/pricing";
import OrderStatusSelect from "@/components/OrderStatusSelect";

export const dynamic = "force-dynamic";

export default function AdminOrderDetailPage({ params }) {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(Number(params.id));
  if (!order) notFound();
  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);

  return (
    <div className="max-w-2xl">
      <Link href="/admin/orders" className="text-sm text-mist-600 hover:underline mb-4 inline-block">
        ← Tất cả đơn hàng
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Đơn hàng #{order.id}</h1>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="bg-white border border-cream-300 rounded-xl2 p-6 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-ink-soft">Khách hàng</p>
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
          {order.note && (
            <div className="sm:col-span-2">
              <p className="text-ink-soft">Ghi chú</p>
              <p className="font-medium">{order.note}</p>
            </div>
          )}
          <div>
            <p className="text-ink-soft">Bảng giá áp dụng</p>
            <p className="font-medium">{tierLabel(order.price_tier)}</p>
          </div>
          <div>
            <p className="text-ink-soft">Ngày đặt</p>
            <p className="font-medium">
              {new Date(order.created_at + "Z").toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        <div className="border-t border-cream-300 pt-4">
          <p className="text-ink-soft text-sm mb-2">Sản phẩm</p>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.product_name} × {item.quantity}
                  <span className="text-ink-soft"> ({formatVND(item.unit_price)}/sp)</span>
                </span>
                <span>{formatVND(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between font-medium text-lg border-t border-cream-300 pt-4">
          <span>Tổng cộng</span>
          <span>{formatVND(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
