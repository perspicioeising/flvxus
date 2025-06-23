"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative p-2 rounded-xl hover:bg-app-border-accent/20 transition-all duration-300 group"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-app-btn-accent" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-app-achievement-workout" />
          <span className="sr-only">Toggle theme</span>
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-app-btn-accent/20 to-app-achievement-workout/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-app-overlay backdrop-blur-xl border border-app-border-default shadow-app-xl rounded-2xl p-2"
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="p-0 m-1"
        >
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all w-full ${
            theme === 'light' 
              ? 'bg-app-btn-accent/10 text-app-btn-accent' 
              : 'hover:bg-app-border-accent/20'
          }`}>
            <div className="w-8 h-8 bg-app-btn-accent/20 rounded-lg flex items-center justify-center">
              <Sun className="h-4 w-4 text-app-btn-accent" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">Claro</span>
              <span className="text-xs text-app-text-secondary">Tema light</span>
            </div>
            {theme === 'light' && (
              <div className="ml-auto w-2 h-2 bg-app-btn-accent rounded-full"></div>
            )}
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="p-0 m-1"
        >
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all w-full ${
            theme === 'dark' 
              ? 'bg-app-achievement-workout/10 text-app-achievement-workout' 
              : 'hover:bg-app-border-accent/20'
          }`}>
            <div className="w-8 h-8 bg-app-achievement-workout/20 rounded-lg flex items-center justify-center">
              <Moon className="h-4 w-4 text-app-achievement-workout" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">Escuro</span>
              <span className="text-xs text-app-text-secondary">Tema dark</span>
            </div>
            {theme === 'dark' && (
              <div className="ml-auto w-2 h-2 bg-app-achievement-workout rounded-full"></div>
            )}
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="p-0 m-1"
        >
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all w-full ${
            theme === 'system' 
              ? 'bg-app-text-accent/10 text-app-text-accent' 
              : 'hover:bg-app-border-accent/20'
          }`}>
            <div className="w-8 h-8 bg-app-text-accent/20 rounded-lg flex items-center justify-center">
              <Monitor className="h-4 w-4 text-app-text-accent" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">Sistema</span>
              <span className="text-xs text-app-text-secondary">Auto detect</span>
            </div>
            {theme === 'system' && (
              <div className="ml-auto w-2 h-2 bg-app-text-accent rounded-full"></div>
            )}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}