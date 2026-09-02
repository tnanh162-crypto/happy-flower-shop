import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

export default function ProtectedAdminLayout({ children }) {
  if (!isAdminSession()) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-cream-100">
      <AdminSidebar />
      <div className="flex-1 min-w-0 p-5 md:p-8">{children}</div>
    </div>
  );
}
