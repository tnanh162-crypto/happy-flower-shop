"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORY_SUGGESTIONS = ["Bó hoa", "Giỏ hoa", "Chậu/Bình", "Hộp hoa", "Kệ hoa"];

export default function ProductForm({ product }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || "Bó hoa",
    description: product?.description || "",
    image_url: product?.image_url || "",
    retail_price: product?.retail_price ?? "",
    wholesale_price: product?.wholesale_price ?? "",
    ctv_price: product?.ctv_price ?? "",
    stock: product?.stock ?? "",
    is_featured: Boolean(product?.is_featured),
    is_bestseller: Boolean(product?.is_bestseller),
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tải ảnh thất bại.");
      updateField("image_url", data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const url = isEdit ? `/api/products/${product.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lưu sản phẩm thất bại.");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && <p className="text-sm text-white bg-clay/90 rounded-lg px-4 py-2.5">{error}</p>}

      <div>
        <label className="block text-sm mb-1.5">Ảnh sản phẩm</label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-xl bg-cream-200 overflow-hidden shrink-0 border border-cream-300">
            {form.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.image_url} alt="" className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div>
            <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
            {uploading && <p className="text-xs text-ink-soft mt-1">Đang tải ảnh lên...</p>}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1.5" htmlFor="name">Tên sản phẩm</label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          className="w-full border border-cream-300 rounded-lg px-4 py-2.5 bg-white focus:border-mist-400 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm mb-1.5" htmlFor="category">Danh mục</label>
        <input
          id="category"
          list="category-suggestions"
          value={form.category}
          onChange={(e) => updateField("category", e.target.value)}
          className="w-full border border-cream-300 rounded-lg px-4 py-2.5 bg-white focus:border-mist-400 outline-none"
        />
        <datalist id="category-suggestions">
          {CATEGORY_SUGGESTIONS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="block text-sm mb-1.5" htmlFor="description">Mô tả</label>
        <textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          className="w-full border border-cream-300 rounded-lg px-4 py-2.5 bg-white focus:border-mist-400 outline-none"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <PriceField label="Giá khách lẻ" value={form.retail_price} onChange={(v) => updateField("retail_price", v)} />
        <PriceField label="Giá khách sỉ" value={form.wholesale_price} onChange={(v) => updateField("wholesale_price", v)} />
        <PriceField label="Giá CTV" value={form.ctv_price} onChange={(v) => updateField("ctv_price", v)} />
      </div>

      <div>
        <label className="block text-sm mb-1.5" htmlFor="stock">Tồn kho</label>
        <input
          id="stock"
          type="number"
          min="0"
          value={form.stock}
          onChange={(e) => updateField("stock", e.target.value)}
          className="w-40 border border-cream-300 rounded-lg px-4 py-2.5 bg-white focus:border-mist-400 outline-none"
        />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => updateField("is_featured", e.target.checked)}
          />
          Sản phẩm nổi bật
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_bestseller}
            onChange={(e) => updateField("is_bestseller", e.target.checked)}
          />
          Bán chạy
        </label>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving || uploading} className="btn-primary disabled:opacity-50">
          {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")} className="btn-secondary">
          Huỷ
        </button>
      </div>
    </form>
  );
}

function PriceField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm mb-1.5">{label}</label>
      <input
        type="number"
        min="0"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-cream-300 rounded-lg px-4 py-2.5 bg-white focus:border-mist-400 outline-none"
      />
    </div>
  );
}
