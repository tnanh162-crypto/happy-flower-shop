"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đăng nhập thất bại.");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100 px-5">
      <div className="w-full max-w-sm">
        <img src="/logo-transparent.png" alt="Happy Flower - Hoa sáp Hải Phòng" className="h-64 w-full max-w-[26rem] object-contain mx-auto mb-3" />
        <p className="text-center text-sm text-ink-soft mb-8">Đăng nhập quản trị</p>

        <form onSubmit={handleSubmit} className="bg-white border border-cream-300 rounded-xl2 p-6 space-y-4">
          <div>
            <label className="block text-sm mb-1.5" htmlFor="username">Tên đăng nhập</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              className="w-full border border-cream-300 rounded-lg px-4 py-2.5 focus:border-mist-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5" htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-cream-300 rounded-lg px-4 py-2.5 focus:border-mist-400 outline-none"
            />
          </div>
          {error && <p className="text-sm text-white bg-clay/90 rounded-lg px-4 py-2.5">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
