import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getCurrentAdmin } from "@/features/admin-auth/authorization";

export const metadata = {
  title: "تسجيل الدخول · لوحة التحكم",
};

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <p className="text-lg font-bold text-brand-navy">كلشي طيب</p>
          <h1 className="mt-2 text-2xl font-bold text-text">تسجيل الدخول</h1>
          <p className="mt-1 text-sm text-text-muted">
            أدخل بيانات الإدارة للمتابعة
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface-elevated p-5 shadow-xs">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
