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
          className="relative p-2 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-300 group"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-orange-600 dark:text-orange-400" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-blue-600 dark:text-blue-400" />
          <span className="sr-only">Toggle theme</span>
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl p-2"
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="p-0 m-1"
        >
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all w-full ${
            theme === 'light' 
              ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' 
              : 'hover:bg-orange-50 dark:hover:bg-orange-900/20'
          }`}>
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Sun className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">Claro</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">Tema light</span>
            </div>
            {theme === 'light' && (
              <div className="ml-auto w-2 h-2 bg-orange-500 rounded-full"></div>
            )}
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="p-0 m-1"
        >
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all w-full ${
            theme === 'dark' 
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
              : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }`}>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Moon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">Escuro</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">Tema dark</span>
            </div>
            {theme === 'dark' && (
              <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="p-0 m-1"
        >
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all w-full ${
            theme === 'system' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
              : 'hover:bg-green-50 dark:hover:bg-green-900/20'
          }`}>
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Monitor className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">Sistema</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">Auto detect</span>
            </div>
            {theme === 'system' && (
              <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}