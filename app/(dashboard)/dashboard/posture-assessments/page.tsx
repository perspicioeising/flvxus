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
import { Plus, Search, Camera, ArrowRight, Trash2, CalendarDays, Eye, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { ptBR } from "date-fns/locale";
import { DataPagination } from "@/components/ui/data-pagination";

export default function PostureAssessmentsPage() {
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

  useEffect(() => {
    fetchAssessments();
    fetchStudents();
  }, []);

  const fetchAssessments = async (page = pagination.page, limit = pagination.limit) => {
    try {
      const response = await fetch(`/api/posture-assessments?page=${page}&limit=${limit}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setAssessments(data.assessments || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar avaliações",
        description: error.message,
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
      
      setStudents(Array.isArray(data.students) ? data.students : []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar alunos",
        description: error.message,
      });
    }
  };

  type Assessment = {
    id: string;
    student_id: string;
    student?: {
      full_name: string;
      id: string;
    };
    created_at: string;
    front_image_url?: string;
    side_image_url?: string;
    back_image_url?: string;
    // add other fields as needed
  };

  type Student = {
    id: string;
    full_name: string;
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/posture-assessments/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Avaliação deletada",
        description: "A avaliação postural foi removida",
      });
      
      fetchAssessments();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar avaliação",
        description: error.message,
      });
    }
  };

  const handlePageChange = (page: number) => {
    fetchAssessments(page, pagination.limit);
  };

  const handlePageSizeChange = (pageSize: number) => {
    fetchAssessments(1, pageSize);
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch = assessment.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStudent = studentFilter === "all" || assessment.student_id === studentFilter;
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
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Avaliações Posturais</h2>
                  <p className="text-muted-foreground">
                    Gerencie e acompanhe as avaliações posturais dos alunos
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => router.push('/dashboard/posture-assessments/new')}
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
                Visualize e gerencie as avaliações posturais
              </CardDescription>
            </div>
            
            {/* Filtros */}
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
                      
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Camera className="h-4 w-4" />
                          <span className="text-muted-foreground">Fotos:</span>
                          <span className="font-medium">
                            {[
                              assessment.front_image_url && 'Frente',
                              assessment.side_image_url && 'Lado',
                              assessment.back_image_url && 'Costas'
                            ].filter(Boolean).join(', ')}
                          </span>
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
                            onClick={() => router.push(`/dashboard/posture-assessments/${assessment.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Detalhes
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span>Ver avaliação completa</span>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="bg-background/70 backdrop-blur-sm hover:text-destructive"
                            onClick={() => handleDelete(assessment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span>Excluir avaliação</span>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Estado Vazio Aprimorado */}
            {filteredAssessments.length === 0 && (
              <div className="text-center py-12 bg-background/40 rounded-lg border border-dashed border-primary/20">
                <Camera className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Nenhuma avaliação postural encontrada</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery || studentFilter !== 'all'
                    ? "Tente ajustar os filtros de busca"
                    : "Crie uma nova avaliação para começar"}
                </p>
                <Button
                  variant="ghost"
                  className="mt-4 bg-background/70 backdrop-blur-sm"
                  onClick={() => router.push('/dashboard/posture-assessments/new')}
                >
                  <Plus className="mr-2 h-4 w-4" /> Nova Avaliação
                </Button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredAssessments.length > 0 && (
            <div className="mt-6">
              <DataPagination
                page={pagination.page}
                pageSize={pagination.limit}
                total={pagination.total}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}