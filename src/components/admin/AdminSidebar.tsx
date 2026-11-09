"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Inbox,
  History,
  Settings,
  LogOut,
  Compass,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface AdminSidebarProps {
  user: {
    name: string;
    email: string;
  };
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  const navLinks = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Packages CMS", href: "/admin/packages", icon: Package },
    { label: "Enquiry Inbox", href: "/admin/enquiries", icon: Inbox },
    { label: "Activity Logs", href: "/admin/activity", icon: History },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-[#173D32] text-[#FAF9F6] px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-[#215143]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FAF9F6] text-[#173D32] flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif font-bold text-sm">AROHA CMS</span>
            <span className="text-[10px] text-[#A9B8A2] block">Staff Operations</span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-[#FAF9F6] rounded-lg hover:bg-[#215143]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Sidebar / Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#173D32] text-[#FAF9F6] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-[#215143] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#FAF9F6] text-[#173D32] flex items-center justify-center shadow">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-lg font-bold tracking-wider text-[#FAF9F6] block">
                  AROHA
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#A9B8A2] block -mt-0.5">
                  Operations Portal
                </span>
              </div>
            </div>
            {mobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden text-[#A9B8A2] hover:text-[#FAF9F6]"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* User profile brief */}
          <div className="p-4 mx-3 my-3 rounded-xl bg-[#215143]/60 border border-[#FAF9F6]/10 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="font-bold text-[#FAF9F6] truncate">{user.name}</span>
            </div>
            <p className="text-[11px] text-[#A9B8A2] truncate">{user.email}</p>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-colors ${
                    isActive
                      ? "bg-[#FAF9F6] text-[#173D32] shadow-sm"
                      : "text-[#A9B8A2] hover:text-[#FAF9F6] hover:bg-[#215143]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#215143] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 text-xs text-[#A9B8A2] hover:text-[#FAF9F6] rounded-lg hover:bg-[#215143] transition-colors"
          >
            <span className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Public Website</span>
            </span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-300 hover:text-red-200 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{loggingOut ? "Signing Out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}
    </>
  );
}

