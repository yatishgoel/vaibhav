"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPageUrl, navigationItems, userNavigationItems } from "@/utils";
import {
  Home,
  BarChart3,
  FileText,
  TrendingUp,
  Menu,
  X,
  User,
  Clock,
  FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Icon mapping for dynamic icon rendering
const iconMap = {
  BarChart3,
  FileText,
  TrendingUp,
  FolderKanban,
  Clock,
  User,
};

interface LayoutProps {
  children: React.ReactNode;
  currentPageName?: string;
}

export default function Layout({ children, currentPageName }: LayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isHomePage = currentPageName === "Home" || pathname === "/";

  if (isHomePage) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <Link
            href={createPageUrl("Home")}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">
              LeaseFlow
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Analysis
          </p>
          {navigationItems.map((item) => {
            const isActive = pathname === item.url;
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            return (
              <Link
                key={item.title}
                href={item.url}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <IconComponent
                  className={`flex-shrink-0 mr-3 h-5 w-5 ${
                    isActive
                      ? "text-blue-600"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                {item.title}
              </Link>
            );
          })}

          <p className="px-3 pt-6 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Manage
          </p>
          {userNavigationItems.map((item) => {
            const isActive = pathname.startsWith(item.url); // Use startsWith for nested routes like /projects/123
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            return (
              <Link
                key={item.title}
                href={item.url}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <IconComponent
                  className={`flex-shrink-0 mr-3 h-5 w-5 ${
                    isActive
                      ? "text-blue-600"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">AEGYS TECH</div>
          <div className="text-xs text-gray-400">vaibhav@aegystech.com</div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex items-center h-16 px-6 border-b border-gray-200">
              <Link
                href={createPageUrl("Home")}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  LeaseFlow
                </span>
              </Link>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Analysis
              </p>
              {navigationItems.map((item) => {
                const isActive = pathname === item.url;
                const IconComponent =
                  iconMap[item.icon as keyof typeof iconMap];
                return (
                  <Link
                    key={item.title}
                    href={item.url}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <IconComponent
                      className={`flex-shrink-0 mr-3 h-5 w-5 ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    {item.title}
                  </Link>
                );
              })}
              <p className="px-3 pt-6 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Manage
              </p>
              {userNavigationItems.map((item) => {
                const isActive = pathname.startsWith(item.url); // Use startsWith for nested routes
                const IconComponent =
                  iconMap[item.icon as keyof typeof iconMap];
                return (
                  <Link
                    key={item.title}
                    href={item.url}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <IconComponent
                      className={`flex-shrink-0 mr-3 h-5 w-5 ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    {item.title}
                  </Link>
                );
              })}
            </nav>

            <div className="px-6 py-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">AEGYS TECH</div>
              <div className="text-xs text-gray-400">vaibhav@aegystech.com</div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex-1">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
