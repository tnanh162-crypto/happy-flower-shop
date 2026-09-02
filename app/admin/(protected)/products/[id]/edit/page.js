import { notFound } from "next/navigation";
import db from "@/lib/db";
import ProductForm from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default function EditProductPage({ params }) {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(Number(params.id));
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Sửa sản phẩm</h1>
      <ProductForm product={product} />
    </div>
  );
}
