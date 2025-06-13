// components/dashboard/header.tsx - MOBILE ONLY - MINIMAL
"use client";

import Link from "next/link";
import { Dumbbell, Zap } from "lucide-react";

interface HeaderProps {
  userRole: 'trainer' | 'student' | null;
}

export function Header({ userRole }: HeaderProps) {
  return (
    // Header minimalista - apenas logo centralizado
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg md:hidden">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-center px-4 sm:px-6">
          
          {/* Logo Centralizado */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Zap className="h-2 w-2 text-white" />
              </div>
            </div>
            <div>
              <span className="font-black text-xl bg-gradient-to-r from-gray-900 via-green-600 to-gray-900 dark:from-white dark:via-green-400 dark:to-white bg-clip-text text-transparent">
                FLVXUS
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400 -mt-1">Personal Training</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}