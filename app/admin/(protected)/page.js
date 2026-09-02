import Link from "next/link";
import db from "@/lib/db";
import { formatVND } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const productCount = db.prepare("SELECT COUNT(*) c FROM products").get().c;
  const lowStockCount = db.prepare("SELECT COUNT(*) c FROM products WHERE stock <= 5").get().c;
  const orderStats = db
    .prepare("SELECT status, COUNT(*) c FROM orders GROUP BY status")
    .all()
    .reduce((acc, r) => ({ ...acc, [r.status]: r.c }), {});
  const revenue = db
    .prepare("SELECT COALESCE(SUM(total),0) s FROM orders WHERE status != 'cancelled'")
    .get().s;
  const recentOrders = db
    .prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 6")
    .all();

  const cards = [
    { label: "Sản phẩm", value: productCount, href: "/admin/products" },
    { label: "Chờ xác nhận", value: orderStats.pending || 0, href: "/admin/orders?status=pending" },
    { label: "Đang giao", value: orderStats.delivering || 0, href: "/admin/orders?status=delivering" },
    { label: "Doanh thu (chưa huỷ)", value: formatVND(revenue), href: "/admin/orders" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Tổng quan</h1>
      <p className="text-sm text-ink-soft mb-8">Xin chào, đây là tình hình cửa hàng hôm nay.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-white border border-cream-300 rounded-xl2 p-5 hover:border-mist-400 transition-colors"
          >
            <p className="text-xs uppercase tracking-wide text-ink-soft mb-2">{c.label}</p>
            <p className="font-display text-2xl">{c.value}</p>
          </Link>
        ))}
      </div>

      {lowStockCount > 0 && (
        <p className="text-sm bg-clay-light text-ink rounded-lg px-4 py-3 mb-8 inline-block">
          {lowStockCount} sản phẩm sắp hết hàng (≤ 5 sản phẩm).{" "}
          <Link href="/admin/products" className="underline">Kiểm tra ngay</Link>
        </p>
      )}

      <div className="bg-white border border-cream-300 rounded-xl2 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-300">
          <h2 className="font-display text-lg">Đơn hàng gần đây</h2>
          <Link href="/admin/orders" className="text-sm text-mist-600 hover:underline">Xem tất cả</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-5 py-8 text-sm text-ink-soft">Chưa có đơn hàng nào.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-soft border-b border-cream-200">
                <th className="px-5 py-2 font-normal">Mã đơn</th>
                <th className="px-5 py-2 font-normal">Khách hàng</th>
                <th className="px-5 py-2 font-normal">Tổng tiền</th>
                <th className="px-5 py-2 font-normal">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-cream-100 last:border-0">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="text-mist-600 hover:underline">
                      #{o.id}
                    </Link>
                  </td>
                  <td className="px-5 py-3">{o.customer_name}</td>
                  <td className="px-5 py-3">{formatVND(o.total)}</td>
                  <td className="px-5 py-3 capitalize">{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
