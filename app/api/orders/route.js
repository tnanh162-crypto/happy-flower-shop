import { NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdminSession } from "@/lib/auth";
import { tierField, PRICE_TIERS } from "@/lib/pricing";

export async function GET(request) {
  if (!isAdminSession()) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let sql = "SELECT * FROM orders WHERE 1=1";
  const params = [];
  if (status && status !== "all") {
    sql += " AND status = ?";
    params.push(status);
  }
  sql += " ORDER BY created_at DESC";

  const orders = db.prepare(sql).all(...params);
  const itemsStmt = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
  const withItems = orders.map((o) => ({ ...o, items: itemsStmt.all(o.id) }));

  return NextResponse.json({ orders: withItems });
}

export async function POST(request) {
  const body = await request.json().catch(() => null);

  const errors = [];
  if (!body?.customer_name?.trim()) errors.push("Vui lòng nhập họ tên.");
  if (!body?.phone?.trim()) errors.push("Vui lòng nhập số điện thoại.");
  if (!body?.address?.trim()) errors.push("Vui lòng nhập địa chỉ giao hàng.");
  if (!Array.isArray(body?.items) || body.items.length === 0) {
    errors.push("Giỏ hàng đang trống.");
  }
  const validTierKeys = PRICE_TIERS.map((t) => t.key);
  const tier = validTierKeys.includes(body?.price_tier) ? body.price_tier : "retail";

  if (errors.length) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  const productStmt = db.prepare("SELECT * FROM products WHERE id = ?");
  const priceField = tierField(tier);

  const lineItems = [];
  for (const raw of body.items) {
    const product = productStmt.get(Number(raw.productId));
    if (!product) continue;
    const quantity = Math.max(1, Number(raw.quantity) || 1);
    const unitPrice = product[priceField] ?? product.retail_price;
    lineItems.push({
      product_id: product.id,
      product_name: product.name,
      unit_price: unitPrice,
      quantity,
      subtotal: unitPrice * quantity,
    });
  }

  if (lineItems.length === 0) {
    return NextResponse.json({ error: "Không có sản phẩm hợp lệ trong giỏ hàng." }, { status: 400 });
  }

  const total = lineItems.reduce((sum, i) => sum + i.subtotal, 0);

  const createOrder = db.transaction(() => {
    const orderInfo = db
      .prepare(`
        INSERT INTO orders (customer_name, phone, address, note, price_tier, status, total)
        VALUES (@customer_name, @phone, @address, @note, @price_tier, 'pending', @total)
      `)
      .run({
        customer_name: body.customer_name.trim(),
        phone: body.phone.trim(),
        address: body.address.trim(),
        note: body.note?.trim() || "",
        price_tier: tier,
        total,
      });

    const orderId = orderInfo.lastInsertRowid;
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
      VALUES (@order_id, @product_id, @product_name, @unit_price, @quantity, @subtotal)
    `);
    const decrementStock = db.prepare(
      "UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?"
    );
    for (const item of lineItems) {
      insertItem.run({ order_id: orderId, ...item });
      decrementStock.run(item.quantity, item.product_id);
    }
    return orderId;
  });

  const orderId = createOrder();
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(orderId);

  return NextResponse.json({ order: { ...order, items } }, { status: 201 });
}
