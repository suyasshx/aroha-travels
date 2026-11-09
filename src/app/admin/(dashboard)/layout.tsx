import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { UserRole } from "@prisma/client";

export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== UserRole.STAFF_ADMIN) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col lg:flex-row">
      <AdminSidebar user={session} />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

