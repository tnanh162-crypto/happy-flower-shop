"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ productId, productName }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/products/${productId}`, { method: "DELETE" });
    router.refresh();
  }

  if (confirming) {
    return (
      <span className="text-xs">
        Xoá &quot;{productName}&quot;?{" "}
        <button onClick={handleDelete} disabled={loading} className="text-clay underline mr-2">
          {loading ? "..." : "Xoá"}
        </button>
        <button onClick={() => setConfirming(false)} className="text-ink-soft underline">
          Huỷ
        </button>
      </span>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="text-xs text-ink-soft hover:text-clay underline">
      Xoá
    </button>
  );
}
