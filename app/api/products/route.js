import { NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdminSession } from "@/lib/auth";
import { uniqueSlug } from "@/lib/utils";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();
  const featured = searchParams.get("featured");
  const bestseller = searchParams.get("bestseller");

  let sql = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (q) {
    sql += " AND (name LIKE ? OR description LIKE ? OR category LIKE ?)";
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }
  if (featured === "1") sql += " AND is_featured = 1";
  if (bestseller === "1") sql += " AND is_bestseller = 1";

  sql += " ORDER BY created_at DESC";

  const products = db.prepare(sql).all(...params);
  return NextResponse.json({ products });
}

export async function POST(request) {
  if (!isAdminSession()) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.name) {
    return NextResponse.json({ error: "Tên sản phẩm là bắt buộc." }, { status: 400 });
  }

  const slug = uniqueSlug(db, body.slug || body.name);

  const stmt = db.prepare(`
    INSERT INTO products
      (name, slug, category, description, image_url, retail_price, wholesale_price, ctv_price, stock, is_featured, is_bestseller)
    VALUES (@name, @slug, @category, @description, @image_url, @retail_price, @wholesale_price, @ctv_price, @stock, @is_featured, @is_bestseller)
  `);

  const info = stmt.run({
    name: body.name,
    slug,
    category: body.category || "Khac",
    description: body.description || "",
    image_url: body.image_url || "",
    retail_price: Number(body.retail_price) || 0,
    wholesale_price: Number(body.wholesale_price) || 0,
    ctv_price: Number(body.ctv_price) || 0,
    stock: Number(body.stock) || 0,
    is_featured: body.is_featured ? 1 : 0,
    is_bestseller: body.is_bestseller ? 1 : 0,
  });

  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(info.lastInsertRowid);
  return NextResponse.json({ product }, { status: 201 });
}
