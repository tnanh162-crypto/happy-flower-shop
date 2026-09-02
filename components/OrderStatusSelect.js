"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "delivering", label: "Đang giao" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Đã huỷ" },
];

export default function OrderStatusSelect({ orderId, status }) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [loading, setLoading] = useState(false);

  async function handleChange(e) {
    const next = e.target.value;
    setCurrent(next);
    setLoading(true);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      disabled={loading}
      className={`text-xs rounded-full px-3 py-1.5 border cursor-pointer ${statusStyle(current)}`}
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

function statusStyle(status) {
  switch (status) {
    case "pending":
      return "bg-clay-light border-clay text-ink";
    case "delivering":
      return "bg-mist-100 border-mist-300 text-mist-600";
    case "completed":
      return "bg-sage/15 border-sage text-ink";
    case "cancelled":
      return "bg-cream-200 border-cream-300 text-ink-soft";
    default:
      return "";
  }
}
