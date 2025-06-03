'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, ArrowRight, Edit, Copy, Trash2, ClipboardList, CalendarDays, Eye, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { DataPagination } from "@/components/ui/data-pagination";


const PROTOCOLS = [
  "McArdle 1992",
  "Guedes 1994"
];

export default function NewPhysicalAssessmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [studentFilter, setStudentFilter] = useState("all");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  // type Student = { id: string; full_name: string };
  // const [students, setStudents] = useState<Student[]>([]);
  type CalculatedResults = {
    body_density: string;
    fat_percentage: string;
    fat_mass: string;
    lean_mass: string;
  } | null;

  const [calculatedResults, setCalculatedResults] = useState<CalculatedResults>(null);

  const [assessment, setAssessment] = useState({
    protocol: "",
    student_id: "",
    date: new Date().toISOString().split('T')[0], // formato YYYY-MM-DD
    weight: "",
    height: "",
    age: "",
    gender: "",
    // Perimetry
    neck: "",
    shoulders: "",
    chest: "",
    abdomen: "",
    waist: "",
    hips: "",
    left_arm: "",
    right_arm: "",
    left_thigh: "",
    right_thigh: "",
    left_calf: "",
    right_calf: "",
    // Skinfolds
    triceps: "",
    abdominal: "",
    suprailiac: "",
    // Outros
    notes: ""
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const calculateResults = () => {
    const {
      protocol,
      gender,
      age,
      weight,
      triceps,
      abdominal,
      suprailiac,
    } = assessment;

    let body_density;
    let fat_percentage;

    // Convert string values to numbers
    const measurements = {
      triceps: parseFloat(triceps),
      abdominal: parseFloat(abdominal),
      suprailiac: parseFloat(suprailiac),
      thigh: parseFloat(assessment.left_thigh), // or use right_thigh if needed
    };

    const numericAge = typeof age === "string" ? parseInt(age, 10) : age;

    if (protocol === "McArdle 1992") {
      if (gender === "male") {
        if (numericAge >= 18 && numericAge <= 34) {
          body_density = 1.1610 - 0.0632 * Math.log10(measurements.triceps + measurements.suprailiac + measurements.abdominal);
        } else if (numericAge >= 18 && numericAge <= 27) {
          body_density = 1.0913 - 0.00116 * (measurements.triceps + measurements.suprailiac);
        }
      } else if (gender === "female") {
        if (numericAge >= 18 && numericAge <= 48) {
          body_density = 1.06234 - 0.00068 * measurements.suprailiac - 0.00039 * measurements.triceps - 0.00025 * measurements.suprailiac;
        }
      }
    } else if (protocol === "Guedes 1994") {
      if (gender === "male") {
        body_density = 1.17136 - 0.06706 * Math.log10(measurements.triceps + measurements.suprailiac + measurements.abdominal);
      } else if (gender === "female") {
        body_density = 1.16650 - 0.07063 * Math.log10(measurements.thigh + measurements.suprailiac + measurements.suprailiac);
      }
    }

    if (body_density) {
      fat_percentage = ((4.95 / body_density) - 4.50) * 100;
      const fat_mass = (fat_percentage / 100) * parseFloat(weight);
      const lean_mass = parseFloat(weight) - fat_mass;

      setCalculatedResults({
        body_density: body_density.toFixed(4),
        fat_percentage: fat_percentage.toFixed(2),
        fat_mass: fat_mass.toFixed(2),
        lean_mass: lean_mass.toFixed(2)
      });
    }
  };

  useEffect(() => {
    if (assessment.protocol && assessment.gender && assessment.age &&
      assessment.weight && assessment.triceps && assessment.abdominal &&
      assessment.suprailiac) {
      calculateResults();
    }
  }, [assessment]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (!calculatedResults) {
        throw new Error("Por favor, preencha todos os campos obrigatórios para calcular os resultados");
      }

      const assessmentData = {
        ...assessment,
        ...calculatedResults,
        // Convert string values to numbers
        weight: parseFloat(assessment.weight),
        height: parseFloat(assessment.height),
        age: parseInt(assessment.age),
        neck: parseFloat(assessment.neck),
        shoulders: parseFloat(assessment.shoulders),
        chest: parseFloat(assessment.chest),
        abdomen: parseFloat(assessment.abdomen),
        waist: parseFloat(assessment.waist),
        hips: parseFloat(assessment.hips),
        left_arm: parseFloat(assessment.left_arm),
        right_arm: parseFloat(assessment.right_arm),
        left_thigh: parseFloat(assessment.left_thigh),
        right_thigh: parseFloat(assessment.right_thigh),
        left_calf: parseFloat(assessment.left_calf),
        right_calf: parseFloat(assessment.right_calf),
        triceps: parseFloat(assessment.triceps),
        abdominal: parseFloat(assessment.abdominal),
        suprailiac: parseFloat(assessment.suprailiac),
      };

      const response = await fetch('/api/physical-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Avaliação criada",
        description: "Avaliação física salva com sucesso",
      });

      router.push('/dashboard/physical-assessments');

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar avaliação",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setStudents(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar alunos",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const fetchAssessments = async () => {
    try {
      const response = await fetch('/api/physical-assessments');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setAssessments(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar avaliações",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  interface Student {
    id: string;
    full_name: string;
    // Add other student fields if needed
  }

  interface Assessment {
    id: string;
    student_id: string;
    student?: Student;
    created_at: string;
    weight: number;
    height: number;
    bmi: number;
    body_fat: number;
    // Add other assessment fields if needed
  }

  const handleDeleteAssessment = async (assessment: Assessment): Promise<void> => {
    try {
      const response = await fetch(`/api/physical-assessments/${assessment.id}`, {
        method: 'DELETE',
      });

      const data: { error?: string } = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Avaliação deletada",
        description: "A avaliação foi removida",
      });
      
      await fetchAssessments();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar avaliação",
        description: error.message,
      });
    }
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch = 
      assessment.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStudent = 
      studentFilter === "all" || 
      assessment.student_id === studentFilter;

    return matchesSearch && matchesStudent;
  });

  return (
    <div className="space-y-6">
  {/* Cabeçalho Aprimorado */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20 w-full">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Avaliações Físicas</h2>
              <p className="text-muted-foreground">
                Acompanhe e gerencie as avaliações físicas dos alunos
              </p>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={() => router.push('/dashboard/physical-assessments/new')}
           className="h-full min-w-[90px] p-3 flex flex-col items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-6 w-6" /> Adicionar
        </Button>
      </div>
    </div>
  </div>

  {/* Card Principal */}
  <Card className="bg-background/60 backdrop-blur-sm border border-primary/20 shadow-sm">
    <CardHeader>
      <div className="flex flex-col space-y-4">
        <div>
          <CardTitle className="text-xl font-bold">Histórico de Avaliações</CardTitle>
          <CardDescription className="text-muted-foreground">
            Visualize e gerencie as avaliações físicas
          </CardDescription>
        </div>
        
        {/* Filtros Aprimorados */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alunos..."
              className="pl-10 bg-background/70 backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={studentFilter} onValueChange={setStudentFilter}>
            <SelectTrigger className="w-[200px] bg-background/70 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <SelectValue placeholder="Filtrar por aluno" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-background/90 backdrop-blur-sm border border-primary/20">
              <SelectItem value="all">Todos os Alunos</SelectItem>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardHeader>
    
    <CardContent>
      {/* Lista de Avaliações */}
      <div className="space-y-3">
        {filteredAssessments.map((assessment) => (
          <Card 
            key={assessment.id} 
            className="bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-all border border-primary/20 hover:border-primary/30"
          >
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-primary/20">
                      <AvatarImage alt={assessment.student?.full_name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {assessment.student?.full_name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {assessment.student?.full_name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        {format(new Date(assessment.created_at), 'PPP', { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div className="bg-primary/5 p-2 rounded-lg">
                      <span className="text-muted-foreground">Peso:</span>
                      <span className="ml-1 font-medium">{assessment.weight} kg</span>
                    </div>
                    <div className="bg-primary/5 p-2 rounded-lg">
                      <span className="text-muted-foreground">Altura:</span>
                      <span className="ml-1 font-medium">{assessment.height} cm</span>
                    </div>
                    <div className="bg-primary/5 p-2 rounded-lg">
                      <span className="text-muted-foreground">IMC:</span>
                      <span className="ml-1 font-medium">{assessment.bmi}</span>
                    </div>
                    <div className="bg-primary/5 p-2 rounded-lg">
                      <span className="text-muted-foreground">Gordura Corporal:</span>
                      <span className="ml-1 font-medium">{assessment.body_fat}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-background/70 backdrop-blur-sm"
                        onClick={() => router.push(`/dashboard/physical-assessments/${assessment.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ver avaliação completa</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="bg-background/70 backdrop-blur-sm"
                        onClick={() => router.push(`/dashboard/physical-assessments/${assessment.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar avaliação</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="bg-background/70 backdrop-blur-sm hover:text-destructive"
                        onClick={() => handleDeleteAssessment(assessment)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Excluir avaliação</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Estado Vazio Aprimorado */}
        {filteredAssessments.length === 0 && (
          <div className="text-center py-12 bg-background/40 rounded-lg border border-dashed border-primary/20">
            <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Nenhuma avaliação encontrada</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || studentFilter !== 'all'
                ? "Tente ajustar os filtros de busca"
                : "Crie uma nova avaliação para começar"}
            </p>
            <Button
              variant="ghost"
              className="mt-4 bg-background/70 backdrop-blur-sm"
              onClick={() => router.push('/dashboard/physical-assessments/new')}
            >
              <Plus className="mr-2 h-4 w-4" /> Nova Avaliação
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
</div>
  );
}