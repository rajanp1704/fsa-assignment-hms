"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useRequireAuth } from "@/hooks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import AppIcon from "../AppIcon";

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    switch (user?.role) {
      case "patient":
        return "/patient/dashboard";
      case "doctor":
        return "/doctor/dashboard";
      case "labstaff":
        return "/lab/dashboard";

      default:
        return "/";
    }
  };

  const getProfileLink = () => {
    switch (user?.role) {
      case "patient":
        return "/patient/profile";
      case "doctor":
        return "/doctor/profile";
      case "labstaff":
        return "/lab/profile";
      case "admin":
        return "/admin/profile";
      default:
        return "/";
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-2">
          <AppIcon />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <div className="flex items-center space-x-1 mr-4 bg-muted/30 p-1 rounded-full">
            {[
              { name: "Home", href: "/" },
              { name: "About", href: "/about" },
              { name: "Services", href: "/services" },
              { name: "Contact", href: "/contact" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-bold transition-all duration-300 rounded-full",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                    : "text-muted-foreground hover:text-primary hover:bg-white/50"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
          {!isAuthenticated ? (
            <>
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-5 py-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Button
                  asChild
                  className="rounded-full px-6 font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95"
                >
                  <Link href="/register">Join Us</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href={getDashboardLink()}
                className={cn(
                  "px-4 py-2 text-sm font-bold transition-all rounded-full",
                  pathname.includes("dashboard")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                Dashboard
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-12 w-12 rounded-full p-0 overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-colors"
                  >
                    <Avatar className="h-full w-full">
                      <AvatarFallback className="bg-primary text-primary-foreground font-black text-lg">
                        {user?.email ? getInitials(user.email) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 p-2 rounded-2xl glass-card border-white/20"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-base font-black leading-none truncate">
                        {user?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-70">
                        {user?.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-primary/10" />
                  <div className="p-1 space-y-1">
                    <DropdownMenuItem asChild>
                      <Link
                        href={getDashboardLink()}
                        className="cursor-pointer rounded-xl font-bold gap-3 p-3"
                      >
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={getProfileLink()}
                        className="cursor-pointer rounded-xl font-bold gap-3 p-3"
                      >
                        <User className="h-5 w-5 text-primary" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="bg-primary/10" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-red-600 rounded-xl font-bold gap-3 p-3 mt-1 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-full hover:bg-primary/10"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-primary" />
          ) : (
            <Menu className="h-6 w-6 text-primary" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/90 backdrop-blur-xl animate-in slide-in-from-top duration-300">
          <nav className="container py-6 flex flex-col gap-2">
            {!isAuthenticated ? (
              <>
                {["Home", "About", "Services", "Contact", "Login"].map(
                  (item) => (
                    <Link
                      key={item}
                      href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                      className="px-4 py-3 text-lg font-bold hover:bg-primary/10 rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item}
                    </Link>
                  )
                )}
                <Button
                  asChild
                  className="mt-4 rounded-xl h-14 text-lg font-bold"
                >
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Link
                  href={getDashboardLink()}
                  className="px-4 py-3 text-lg font-bold flex items-center gap-3 hover:bg-primary/10 rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-6 w-6 text-primary" />
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="px-4 py-3 text-lg font-bold flex items-center gap-3 hover:bg-primary/10 rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-6 w-6 text-primary" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 text-lg font-bold text-red-600 text-left flex items-center gap-3 hover:bg-red-50 rounded-xl"
                >
                  <LogOut className="h-6 w-6" />
                  Log out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
