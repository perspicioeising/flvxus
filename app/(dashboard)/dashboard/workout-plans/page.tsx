// page.tsx
'use client';

import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import WorkoutPlansPage from '@/components/workout-plans/components/list/WorkoutPlans';

export default function Page() {
  return (
    <TooltipProvider>
      <WorkoutPlansPage />
    </TooltipProvider>
  );
}