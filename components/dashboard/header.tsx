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
    <header className="sticky top-0 z-40 w-full bg-app-overlay backdrop-blur-xl border-b border-app-border-muted shadow-app-medium md:hidden">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-center px-4 sm:px-6">
          
          {/* Logo Centralizado */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-achievement-consecutive rounded-xl flex items-center justify-center shadow-app-large group-hover:scale-105 transition-transform duration-200">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-achievement-exercise rounded-full flex items-center justify-center">
                <Zap className="h-2 w-2 text-white" />
              </div>
            </div>
            <div>
              <span className="font-black text-xl text-app-heading">
                FLVXUS
              </span>
              <p className="text-xs text-app-text-secondary -mt-1">Personal Training</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}