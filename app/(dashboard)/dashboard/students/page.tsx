// app/dashboard/students/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Search, Filter, Eye, Activity, Mail, Calendar, Users, Loader2, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useSupabase } from "@/app/providers";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from "@/components/ui/pagination";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { AddStudentForm } from "@/app/(dashboard)/dashboard/students/[id]/new/page";

type Student = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: 'active' | 'inactive';
  birth_date: string | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  goals: string[] | null;
  medical_conditions: string | null;
  emergency_contact: string | null;
  preferred_training_time: string | null;
  experience_level: string | null;
  notes: string | null;
  avatar?: string | null;
  createdAt: string;
};

export default function StudentsPage() {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      if (response.ok) {
        setStudents(data);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar alunos",
        description: error.message,
      });
    }
  };

  const handleAddSuccess = () => {
    toast({
      title: "Aluno convidado com sucesso",
      description: "Um email de convite foi enviado para o endereço do aluno.",
    });
    fetchStudents();
    setShowForm(false);
  };

  // Filter students based on search query and status filter
  const filteredStudents = students.filter((student) => {
    const matchesQuery = student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20 w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Meus Alunos</h2>
                  <p className="text-muted-foreground">
                    Gerencie e acompanhe os perfis dos seus alunos
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3">
              <div className="bg-background border border-primary/20 rounded-lg p-3 text-center min-w-[90px] hover:bg-primary/5 transition-colors cursor-default">
                <div className="text-xl font-bold text-primary">{students.filter(s => s.status === 'active').length}</div>
                <div className="text-xs text-muted-foreground">Ativos</div>
              </div>
              <div className="bg-background border border-border rounded-lg p-3 text-center min-w-[90px] hover:bg-primary/5 transition-colors cursor-default">
                <div className="text-xl font-bold">{students.length}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <Button 
                className="h-full min-w-[90px] p-3 flex flex-col items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setShowForm(true)}
              >
                <Plus className="h-6 w-6" />
                <span className="text-xs">Adicionar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mostrar o formulário quando showForm for true */}
      {showForm && (
        <Card className="bg-background/60 backdrop-blur-sm border border-primary/20 shadow-sm">
          <CardContent className="pt-6">
            <AddStudentForm 
              onSuccess={handleAddSuccess} 
              onCancel={() => setShowForm(false)} 
            />
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <Card className="bg-background/60 backdrop-blur-sm border border-primary/20 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Lista de Alunos</h3>
              <div className="text-sm text-muted-foreground">
                {filteredStudents.length} {filteredStudents.length === 1 ? 'aluno' : 'alunos'} encontrados
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Filtros Aprimorados */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  className="pl-8 bg-background/70 backdrop-blur-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background/70 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filtrar status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-background/90 backdrop-blur-sm border border-primary/20">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Layout de Cards Moderno */}
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12 bg-background/40 rounded-lg border border-dashed border-primary/20">
                <Users className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Nenhum aluno encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery || statusFilter !== 'all'
                    ? "Tente ajustar os filtros de busca"
                    : "Adicione novos alunos para começar"}
                </p>
             
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredStudents.map((student) => (
                   <Card
                    key={student.id}
                    className="bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-all border border-primary/20 hover:border-primary/30 group overflow-hidden"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-primary/20">
                            <AvatarImage alt={student.full_name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {student.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="overflow-hidden">

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <h4 className="font-semibold truncate max-w-[120px]">{student.full_name}</h4>
                              </TooltipTrigger>
                              <TooltipContent>{student.full_name}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-sm text-muted-foreground truncate max-w-[120px]">
                                  {student.email}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>{student.email}</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <Badge
                          variant={student.status === 'active' ? 'default' : 'secondary'}
                          className="capitalize backdrop-blur-sm"
                        >
                          {student.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Nível: <span className="text-foreground font-medium">{student.experience_level || '-'}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Desde: <span className="text-foreground">{new Date(student.createdAt).toLocaleDateString()}</span>
                          </p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm border border-primary/20"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 bg-background/90 backdrop-blur-sm border border-primary/20"
                          >
                            <DropdownMenuItem asChild className="hover:bg-primary/5">
                              <Link href={`/dashboard/students/${student.id}`} className="flex items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Perfil
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="hover:bg-primary/5">
                              <Link href={`/dashboard/students/${student.id}/workouts`} className="flex items-center">
                                <Activity className="mr-2 h-4 w-4" />
                                Treinos
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="hover:bg-primary/5">
                              <Link href={`/dashboard/students/${student.id}/assessments`} className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4" />
                                Avaliações
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-primary/20" />
                            <DropdownMenuItem className="flex items-center hover:bg-primary/5">
                              <Mail className="mr-2 h-4 w-4" />
                              Enviar Mensagem
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-primary/20" />
                            <DropdownMenuItem className="text-destructive flex items-center hover:bg-destructive/5">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remover Aluno
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Paginação Estilizada */}
            {filteredStudents.length > 8 && (
              <div className="mt-6 flex justify-end">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        className="bg-background/70 backdrop-blur-sm border border-primary/20"
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        className="bg-background/70 backdrop-blur-sm border border-primary/20"
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        className="bg-background/70 backdrop-blur-sm border border-primary/20"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}