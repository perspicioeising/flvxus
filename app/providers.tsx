'use client';

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { createContext, useContext, useState, useEffect } from "react";
import { Session, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/browser";
import { Database } from "@/types/database.types";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CapacitorProvider } from "./capacitor-provider";

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
  session: Session | null;
}

const SupabaseContext = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseProvider({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <SupabaseContext.Provider value={{ supabase, session }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }
  return context;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <CapacitorProvider>
          <SupabaseProvider>
            {children}
            <Toaster />
          </SupabaseProvider>
        </CapacitorProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}