'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, PlayCircle, Edit, Copy, Trash2, Upload, Video, X, Grid, LayoutList, Dumbbell, Eye, List, Library } from "lucide-react";
import { useSupabase } from "@/app/providers";
import { useToast } from "@/hooks/use-toast";
import { useExercises } from "@/hooks/use-exercises";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { DataPagination } from "@/components/ui/data-pagination";

const MUSCLE_GROUPS = [
  "Peito", "Costas", "Pernas", "Ombros", "Braços", "Core", "Corpo Inteiro", "Cardio"
];

const EQUIPMENT_TYPES = [
  "Peso Livre",
  "Máquina",
  "Cabo",
  "Peso Corporal",
  "Elástico",
  "Kettlebell",
  "TRX",
  "Outros"
];

export default function ExercisesPage() {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null);
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [newExercise, setNewExercise] = useState<NewExercise>({
    name: "",
    description: "",
    muscleGroups: [],
    equipment: [],
    variations: "",
    videoUrl: "",
    tips: "",
    commonErrors: "",
  });

  const fetchExercises = useCallback(async () => {
    try {
      const response = await fetch('/api/exercises');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setExercises(data);
      setPagination(prev => ({
        ...prev,
        total: data.length,
        totalPages: Math.ceil(data.length / prev.limit)
      }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar exercícios",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const changePage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const changePageSize = (limit: number) => {
    setPagination(prev => ({
      ...prev,
      limit,
      totalPages: Math.ceil(prev.total / limit)
    }));
  };

  // ... rest of the component code remains exactly the same ...

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20 w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Exercícios</h2>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-background border border-primary/20 rounded-lg p-3 text-center min-w-[90px] hover:bg-primary/5 transition-colors cursor-default">
                <div className="text-xl font-bold text-primary">
                  {exercises.length}
                </div>
                <div className="text-xs text-muted-foreground">Ativos</div>
              </div>
              <div className="bg-background border border-border rounded-lg p-3 text-center min-w-[90px] hover:bg-primary/5 transition-colors cursor-default">
                <div className="text-xl font-bold">{exercises.length}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>

              <Button
                onClick={() => setIsAddingExercise(true)}
                disabled={isAddingExercise}
                className="h-full min-w-[90px] p-3 flex flex-col items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="h-6 w-6" />
                <span className="text-xs">Adicionar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ... rest of the component JSX remains exactly the same until the pagination section ... */}

      <Card className="bg-background/60 backdrop-blur-xl border border-primary/20 border shadow-sm">
        <CardHeader className="pb-6">
          {/* ... existing card header content ... */}
        </CardHeader>
        <CardContent>
          {/* ... existing exercises list content ... */}

          {filteredExercises.length > 0 && (
            <DataPagination
              page={pagination.page}
              pageSize={pagination.limit}
              total={pagination.total}
              totalPages={pagination.totalPages}
              onPageChange={changePage}
              onPageSizeChange={changePageSize}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}