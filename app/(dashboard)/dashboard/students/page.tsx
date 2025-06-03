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
import { Plus, MoreHorizontal, Search, Filter, Eye, Activity, Mail, Calendar, Users, Loader2, Trash2, Phone, Star } from "lucide-react";
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

  const getExperienceColor = (level: string | null) => {
    switch (level?.toLowerCase()) {
      case 'iniciante': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediário': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'avançado': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-500 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-600 border-gray-200';
  };

  // Filter students based on search query and status filter
  const filteredStudents = students.filter((student) => {
    const matchesQuery = student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-green-50 to-indigo-50">
      <div className="bg-gradient-to-r from-primary/40 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
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
              <div className="bg-background border backdrop-blur-sm border-primary/20 rounded-lg p-3 text-center min-w-[90px] hover:bg-primary/5 transition-colors cursor-default">
                <div className="text-xl font-bold text-primary">{students.filter(s => s.status === 'active').length}</div>
                <div className="text-xs text-muted-foreground">Ativos</div>
              </div>
              <div className="bg-background border border-border backdrop-blur-sm rounded-lg p-3 text-center min-w-[90px] hover:bg-primary/5 transition-colors cursor-default">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredStudents.map((student) => (
                  <Card key={student.id} className="group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 bg-transparent backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-0">
                      {/* Card Header */}
                      <div className="bg-gradient-to-r from-primary/40 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20 w-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold backdrop-blur-sm">
                              {student.full_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
                              {student.status === 'active' ? 'Ativo' : 'Inativo'}
                            </div>
                          </div>
                          <h3 className="text-xl  mb-1">{student.full_name} </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" color="green" />
                            <span className=" text-sm">{student.email}</span>

                          </div>

                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {student.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-4 w-4"  color="green" />
                              <span className="truncate">{student.phone}</span>
                            </div>
                          )}
                          {student.experience_level && (
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getExperienceColor(student.experience_level)}`}>
                                {student.experience_level}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 space-y-4">
                        {/* Goals */}
                        {student.goals && student.goals.length > 0 && (
                          <div>
                            <div className="text-sm font-medium font-semibold mb-2">Objetivos:</div>
                            <div className="flex flex-wrap gap-1">
                              {student.goals.slice(0, 3).map((goal) => (
                                <Badge key={goal} variant="secondary" className="text-xs">
                                  {goal}
                                </Badge>
                              ))}
                              {student.goals.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{student.goals.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t">
                          <Button variant="outline" size="sm" className="flex-1 hover:bg-primary-50 hover:border-green-500 transition-colors">
                            <Eye className="mr-2 h-4 w-4" />
                            Perfil
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="hover:bg-gray-50 transition-colors">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem>
                                <Activity className="mr-2 h-4 w-4" />
                                Ver Treinos
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                Avaliações
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Enviar Mensagem
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                Remover Aluno
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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