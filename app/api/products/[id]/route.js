import { NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdminSession } from "@/lib/auth";
import { uniqueSlug } from "@/lib/utils";

function findProduct(idParam) {
  const numericId = Number(idParam);
  if (!Number.isNaN(numericId)) {
    const byId = db.prepare("SELECT * FROM products WHERE id = ?").get(numericId);
    if (byId) return byId;
  }
  return db.prepare("SELECT * FROM products WHERE slug = ?").get(idParam);
}

export async function GET(_request, { params }) {
  const product = findProduct(params.id);
  if (!product) {
    return NextResponse.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PUT(request, { params }) {
  if (!isAdminSession()) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 401 });
  }
  const existing = findProduct(params.id);
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.name) {
    return NextResponse.json({ error: "Tên sản phẩm là bắt buộc." }, { status: 400 });
  }

  const slug =
    body.slug && body.slug !== existing.slug
      ? uniqueSlug(db, body.slug, existing.id)
      : existing.slug;

  db.prepare(`
    UPDATE products SET
      name = @name,
      slug = @slug,
      category = @category,
      description = @description,
      image_url = @image_url,
      retail_price = @retail_price,
      wholesale_price = @wholesale_price,
      ctv_price = @ctv_price,
      stock = @stock,
      is_featured = @is_featured,
      is_bestseller = @is_bestseller
    WHERE id = @id
  `).run({
    id: existing.id,
    name: body.name,
    slug,
    category: body.category || "Khac",
    description: body.description || "",
    image_url: body.image_url ?? existing.image_url,
    retail_price: Number(body.retail_price) || 0,
    wholesale_price: Number(body.wholesale_price) || 0,
    ctv_price: Number(body.ctv_price) || 0,
    stock: Number(body.stock) || 0,
    is_featured: body.is_featured ? 1 : 0,
    is_bestseller: body.is_bestseller ? 1 : 0,
  });

  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(existing.id);
  return NextResponse.json({ product });
}

export async function DELETE(_request, { params }) {
  if (!isAdminSession()) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 401 });
  }
  const existing = findProduct(params.id);
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
  }
  db.prepare("DELETE FROM products WHERE id = ?").run(existing.id);
  return NextResponse.json({ ok: true });
}
