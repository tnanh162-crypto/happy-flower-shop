import { notFound } from "next/navigation";
import db from "@/lib/db";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

function getProduct(idParam) {
  const numericId = Number(idParam);
  if (!Number.isNaN(numericId)) {
    const byId = db.prepare("SELECT * FROM products WHERE id = ?").get(numericId);
    if (byId) return byId;
  }
  return db.prepare("SELECT * FROM products WHERE slug = ?").get(idParam);
}

export default function ProductPage({ params }) {
  const product = getProduct(params.id);
  if (!product) notFound();

  const related = db
    .prepare("SELECT * FROM products WHERE category = ? AND id != ? LIMIT 4")
    .all(product.category, product.id);

  return (
    <div className="container-shop py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-[4/5] rounded-xl2 overflow-hidden bg-cream-200">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-mist-300">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-mist-600 mb-2">{product.category}</p>
          <h1 className="font-display text-3xl md:text-4xl mb-4">{product.name}</h1>
          <p className="text-ink-soft leading-relaxed mb-8">{product.description}</p>
          <ProductDetailActions product={product} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl mb-6">Có thể bạn cũng thích</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
