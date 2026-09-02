import Link from "next/link";
import db from "@/lib/db";
import { formatVND } from "@/lib/pricing";
import DeleteProductButton from "@/components/DeleteProductButton";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  const products = db.prepare("SELECT * FROM products ORDER BY created_at DESC").all();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl">Sản phẩm</h1>
          <p className="text-sm text-ink-soft">{products.length} sản phẩm trong cửa hàng</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">+ Thêm sản phẩm</Link>
      </div>

      <div className="bg-white border border-cream-300 rounded-xl2 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-ink-soft border-b border-cream-200">
              <th className="px-5 py-3 font-normal">Sản phẩm</th>
              <th className="px-5 py-3 font-normal">Danh mục</th>
              <th className="px-5 py-3 font-normal">Giá lẻ / sỉ / CTV</th>
              <th className="px-5 py-3 font-normal">Tồn kho</th>
              <th className="px-5 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-cream-100 last:border-0 align-middle">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-cream-200 overflow-hidden shrink-0">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <div className="flex gap-1 mt-0.5">
                        {p.is_featured ? <Tag>Nổi bật</Tag> : null}
                        {p.is_bestseller ? <Tag>Bán chạy</Tag> : null}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">{p.category}</td>
                <td className="px-5 py-3 whitespace-nowrap">
                  {formatVND(p.retail_price)} / {formatVND(p.wholesale_price)} / {formatVND(p.ctv_price)}
                </td>
                <td className="px-5 py-3">
                  <span className={p.stock <= 5 ? "text-clay font-medium" : ""}>{p.stock}</span>
                </td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <Link href={`/admin/products/${p.id}/edit`} className="text-xs text-mist-600 hover:underline mr-3">
                    Sửa
                  </Link>
                  <DeleteProductButton productId={p.id} productName={p.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="px-5 py-10 text-sm text-ink-soft">Chưa có sản phẩm. Bấm &quot;Thêm sản phẩm&quot; để bắt đầu.</p>
        )}
      </div>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="text-[10px] bg-mist-100 text-mist-600 px-1.5 py-0.5 rounded-full">
      {children}
    </span>
  );
}
