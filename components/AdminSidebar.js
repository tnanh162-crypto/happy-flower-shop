"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Tổng quan", exact: true },
  { href: "/admin/products", label: "Sản phẩm" },
  { href: "/admin/orders", label: "Đơn hàng" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-full md:w-56 shrink-0 md:min-h-[calc(100vh-0px)] bg-mist-600 text-cream/90 flex md:flex-col">
      <div className="px-5 py-4 hidden md:block">
        <img src="/logo-transparent.png" alt="Happy Flower - Hoa sáp Hải Phòng" className="w-full h-32 object-contain brightness-0 invert contrast-125" />
        <span className="text-mist-400 text-sm">Khu vực quản trị</span>
      </div>
      <nav className="flex md:flex-col flex-1 px-2 md:px-3 gap-1 py-2 md:py-0 overflow-x-auto">
        {LINKS.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                active ? "bg-cream/10 text-cream" : "hover:bg-cream/5"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 hidden md:block">
        <Link href="/" className="text-xs text-cream/60 hover:text-cream block mb-3">
          ← Xem cửa hàng
        </Link>
        <button onClick={handleLogout} className="text-xs text-cream/60 hover:text-cream">
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
