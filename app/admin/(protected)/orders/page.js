import Link from "next/link";
import db from "@/lib/db";
import { formatVND, tierLabel } from "@/lib/pricing";
import OrderStatusSelect from "@/components/OrderStatusSelect";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "delivering", label: "Đang giao" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Đã huỷ" },
];

export default function AdminOrdersPage({ searchParams }) {
  const status = searchParams?.status || "all";
  let sql = "SELECT * FROM orders WHERE 1=1";
  const params = [];
  if (status !== "all") {
    sql += " AND status = ?";
    params.push(status);
  }
  sql += " ORDER BY created_at DESC";
  const orders = db.prepare(sql).all(...params);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl mb-1">Đơn hàng</h1>
        <p className="text-sm text-ink-soft">{orders.length} đơn hàng</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? "/admin/orders" : `/admin/orders?status=${f.value}`}
            className={`shrink-0 text-sm rounded-full px-4 py-1.5 border transition-colors ${
              status === f.value
                ? "bg-ink text-cream border-ink"
                : "border-cream-300 hover:border-mist-400"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-cream-300 rounded-xl2 overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="text-left text-ink-soft border-b border-cream-200">
              <th className="px-5 py-3 font-normal">Mã đơn</th>
              <th className="px-5 py-3 font-normal">Khách hàng</th>
              <th className="px-5 py-3 font-normal">Số điện thoại</th>
              <th className="px-5 py-3 font-normal">Bảng giá</th>
              <th className="px-5 py-3 font-normal">Tổng tiền</th>
              <th className="px-5 py-3 font-normal">Ngày đặt</th>
              <th className="px-5 py-3 font-normal">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-cream-100 last:border-0">
                <td className="px-5 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-mist-600 hover:underline font-medium">
                    #{o.id}
                  </Link>
                </td>
                <td className="px-5 py-3">{o.customer_name}</td>
                <td className="px-5 py-3">{o.phone}</td>
                <td className="px-5 py-3">{tierLabel(o.price_tier)}</td>
                <td className="px-5 py-3 whitespace-nowrap">{formatVND(o.total)}</td>
                <td className="px-5 py-3 whitespace-nowrap text-ink-soft">
                  {new Date(o.created_at + "Z").toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-5 py-3">
                  <OrderStatusSelect orderId={o.id} status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="px-5 py-10 text-sm text-ink-soft">Không có đơn hàng nào ở trạng thái này.</p>
        )}
      </div>
    </div>
  );
}
