import { NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdminSession } from "@/lib/auth";

const VALID_STATUSES = ["pending", "delivering", "completed", "cancelled"];

export async function GET(_request, { params }) {
  // Order confirmation pages need to be readable right after checkout without
  // an admin session, so this endpoint intentionally stays public by id.
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(Number(params.id));
  if (!order) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  }
  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
  return NextResponse.json({ order: { ...order, items } });
}

export async function PATCH(request, { params }) {
  if (!isAdminSession()) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!VALID_STATUSES.includes(body?.status)) {
    return NextResponse.json({ error: "Trạng thái không hợp lệ." }, { status: 400 });
  }
  const existing = db.prepare("SELECT * FROM orders WHERE id = ?").get(Number(params.id));
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  }
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(body.status, existing.id);
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(existing.id);
  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(existing.id);
  return NextResponse.json({ order: { ...order, items } });
}
