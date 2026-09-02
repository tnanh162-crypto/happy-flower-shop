"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartContext";
import TierSwitcher from "./TierSwitcher";

export default function Navbar() {
  const { itemCount } = useCart();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(e) {
    e.preventDefault();
    router.push(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : "/");
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-cream-300">
      <div className="container-shop flex items-center gap-4 py-2">
        <Link href="/" className="flex items-center shrink-0" aria-label="Happy Flower - Hoa sáp Hải Phòng">
          <img src="/logo-transparent.png" alt="Happy Flower - Hoa sáp Hải Phòng" className="h-20 w-24 sm:h-24 sm:w-28 max-w-[28vw] object-contain" />
          <span className="sr-only">Happy Flower - Hoa sáp Hải Phòng</span>
        </Link>

        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-md items-center bg-white rounded-full border border-cream-300 px-4 py-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-ink-soft shrink-0">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm hoa, dịp tặng..."
            className="ml-2 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-soft/70"
          />
        </form>

        <nav className="hidden md:flex items-center gap-6 ml-auto text-sm">
          <Link href="/" className="hover:text-mist-600">Trang chủ</Link>
          <Link href="/?featured=1" className="hover:text-mist-600">Nổi bật</Link>
          <TierSwitcher />
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 hover:text-mist-600"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-1.5 6h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="21" r="1.3" fill="currentColor" />
              <circle cx="17" cy="21" r="1.3" fill="currentColor" />
            </svg>
            Giỏ hàng
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-mist-500 text-white text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </nav>

        <button
          className="md:hidden ml-auto p-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Mở menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <Link href="/cart" className="md:hidden relative p-2" aria-label="Giỏ hàng">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-1.5 6h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="21" r="1.3" fill="currentColor" />
            <circle cx="17" cy="21" r="1.3" fill="currentColor" />
          </svg>
          {itemCount > 0 && (
            <span className="absolute top-0 right-0 bg-mist-500 text-white text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Link>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-cream-300 bg-cream px-5 py-4 space-y-4">
          <form onSubmit={handleSearch} className="flex items-center bg-white rounded-full border border-cream-300 px-4 py-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm hoa, dịp tặng..."
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </form>
          <div className="flex flex-col gap-3 text-sm">
            <Link href="/" onClick={() => setMenuOpen(false)}>Trang chủ</Link>
            <Link href="/?featured=1" onClick={() => setMenuOpen(false)}>Nổi bật</Link>
          </div>
          <TierSwitcher compact />
        </div>
      )}
    </header>
  );
}
