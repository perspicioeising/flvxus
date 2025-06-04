'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { Plus, Search, Filter, Calendar, ArrowRight, Copy, Trash2, Edit, CalendarDays, Eye, User, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { ptBR } from "date-fns/locale";
import { Tooltip } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function StudentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

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

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      student.status === statusFilter;

    return matchesSearch && matchesStatus;
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
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Meus Alunos</h2>
                  <p className="text-muted-foreground">
                    Gerencie e acompanhe seus alunos
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => router.push('/dashboard/students/new')}
              className="h-full min-w-[90px] p-3 flex flex-col items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-6 w-6" />
              <span className="text-xs">Adicionar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Card Principal */}
      <Card className="bg-background/60 backdrop-blur-sm border border-primary/20 shadow-sm">
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div>
              <CardTitle className="text-xl font-bold">Gerenciamento de Alunos</CardTitle>
              <CardDescription className="text-muted-foreground">
                Navegue e gerencie seus alunos
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-background/70 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-background/90 backdrop-blur-sm border border-primary/20">
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Lista de Alunos */}
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <Card 
                key={student.id} 
                className="bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-all border border-primary/20 hover:border-primary/30"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10 border border-primary/20">
                          <AvatarImage alt={student.full_name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {student.full_name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{student.full_name}</h3>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" color="green" />
                            <span className=" text-sm">{student.email}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {student.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-4 w-4" color="green" />
                              <span className="truncate">{student.phone}</span>
                            </div>
                          )}
                          {student.experience_level && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">
                                {student.experience_level}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <div>Objetivos: <span className="font-medium">{student.goals?.join(", ") || "Não definidos"}</span></div>
                        <div>•</div>
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {format(new Date(student.created_at), 'PPP', { locale: ptBR })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-background/70 backdrop-blur-sm"
                        onClick={() => router.push(`/dashboard/students/${student.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Estado Vazio Aprimorado */}
            {filteredStudents.length === 0 && (
              <div className="text-center py-12 bg-background/40 rounded-lg border border-dashed border-primary/20">
                <User className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Nenhum aluno encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery || statusFilter !== 'all'
                    ? "Tente ajustar os filtros de busca"
                    : "Adicione novos alunos para começar"}
                </p>
                <Button
                  variant="ghost"
                  className="mt-4 bg-background/70 backdrop-blur-sm"
                  onClick={() => router.push('/dashboard/students/new')}
                >
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Aluno
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}