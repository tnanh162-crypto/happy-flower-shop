import Link from "next/link";
import db from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

function getProducts({ q, category, featured, bestseller } = {}) {
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
  if (featured) sql += " AND is_featured = 1";
  if (bestseller) sql += " AND is_bestseller = 1";
  sql += " ORDER BY created_at DESC";
  return db.prepare(sql).all(...params);
}

function getCategories() {
  return db
    .prepare("SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC")
    .all();
}

export default function HomePage({ searchParams }) {
  const q = searchParams?.q?.trim();
  const category = searchParams?.category?.trim();
  const featuredOnly = searchParams?.featured === "1";
  const bestsellerOnly = searchParams?.bestseller === "1";

  if (q || category || featuredOnly || bestsellerOnly) {
    const products = getProducts({ q, category, featured: featuredOnly, bestseller: bestsellerOnly });
    return (
      <div className="container-shop py-10">
        <p className="text-sm text-ink-soft mb-1">
          {q
            ? `Kết quả tìm kiếm cho "${q}"`
            : category
            ? `Danh mục: ${category}`
            : bestsellerOnly
            ? "Sản phẩm bán chạy"
            : "Sản phẩm nổi bật"}
        </p>
        <h1 className="font-display text-3xl mb-8">{products.length} sản phẩm</h1>
        {products.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const bestsellers = getProducts({ bestseller: true }).slice(0, 4);
  const featured = getProducts({ featured: true }).slice(0, 8);
  const categories = getCategories();
  const newest = getProducts({}).slice(0, 8);

  return (
    <div>
      <Hero />

      <section className="container-shop py-14">
        <h2 className="font-display text-2xl mb-6">Danh mục</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {categories.map((c) => (
            <Link
              key={c.category}
              href={`/?category=${encodeURIComponent(c.category)}`}
              className="shrink-0 bg-white border border-cream-300 rounded-full px-5 py-2.5 text-sm hover:border-mist-400 hover:text-mist-600 transition-colors"
            >
              {c.category}
              <span className="text-ink-soft/70"> · {c.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {bestsellers.length > 0 && (
        <section className="container-shop py-6">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-2xl">Bán chạy nhất</h2>
            <Link href="/?bestseller=1" className="text-sm text-mist-600 hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="container-shop py-14">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-2xl">Gợi ý cho bạn</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {(featured.length > 0 ? featured : newest).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <TierBanner />
    </div>
  );
}

function Hero() {
  return (
    <section className="container-shop pt-10 pb-6 md:pt-16">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="uppercase text-xs tracking-wide text-mist-600 mb-4">
            Hoa tươi mỗi sáng · Giao trong 2 giờ
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight mb-5">
            Gửi một lời yêu thương,
            <br className="hidden md:block" /> bằng những cánh hoa tươi.
          </h1>
          <p className="text-ink-soft max-w-md mb-8">
            Từ bó hoa hằng ngày đến kệ hoa chúc mừng, mỗi thiết kế tại Happy Flower
            đều được cắm tay trong ngày để giữ trọn vẹn sắc hoa tươi mới.
          </p>
          <div className="flex gap-3">
            <Link href="/?featured=1" className="btn-primary">Khám phá bộ sưu tập</Link>
            <Link href="/?bestseller=1" className="btn-secondary">Xem bán chạy</Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] rounded-xl2 overflow-hidden bg-white p-4 md:p-7 shadow-soft">
          <img
            src="/logo-transparent.png"
            alt="Happy Flower - Hoa sáp Hải Phòng"
            className="w-full h-full object-contain drop-shadow-[0_8px_12px_rgba(32,54,64,0.08)]"
          />
        </div>
      </div>
    </section>
  );
}

function TierBanner() {
  return (
    <section className="bg-mist-100 py-12 mt-6">
      <div className="container-shop grid md:grid-cols-3 gap-6 text-sm">
        <div>
          <p className="font-display text-lg mb-1">Khách lẻ</p>
          <p className="text-ink-soft">Mua trực tiếp cho bản thân hoặc làm quà tặng, giá niêm yết cho mọi đơn hàng.</p>
        </div>
        <div>
          <p className="font-display text-lg mb-1">Khách sỉ</p>
          <p className="text-ink-soft">Giá ưu đãi cho cửa hàng hoa, sự kiện và đơn hàng số lượng lớn.</p>
        </div>
        <div>
          <p className="font-display text-lg mb-1">Cộng tác viên</p>
          <p className="text-ink-soft">Mức giá riêng cho CTV bán lại — liên hệ để được cấp tài khoản.</p>
        </div>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 text-ink-soft">
      <p className="mb-2">Không tìm thấy sản phẩm phù hợp.</p>
      <Link href="/" className="text-mist-600 hover:underline">Quay lại trang chủ</Link>
    </div>
  );
}
