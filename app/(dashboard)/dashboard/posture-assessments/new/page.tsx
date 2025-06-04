'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Camera, Zap, User, Users, CheckCircle, Plus, Target, Sparkles, Loader2, X, Search, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function NewPostureAssessmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  type Student = { id: string; full_name: string };
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoadingStudents(true);
      const response = await fetch('/api/students');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setStudents(Array.isArray(data.students) ? data.students : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar alunos",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleCreate = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/posture-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: selectedStudent
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Avaliação criada",
        description: "Você pode agora adicionar fotos e análise",
      });
      
      router.push(`/dashboard/posture-assessments/${data.id}`);
      
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

  const selectedStudentData = students.find(s => s.id === selectedStudent);
  const filteredStudents = students.filter(student => 
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoadingStudents) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin border-t-green-600 dark:border-t-green-400"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-green-400 dark:border-t-green-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="h-8 w-8 text-green-600 dark:text-green-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* Modern Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-6 mb-6">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="p-3 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all"
              >
                <ArrowLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Plus className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-green-600 to-gray-900 dark:from-white dark:via-green-400 dark:to-white bg-clip-text text-transparent">
                    Nova Avaliação Postural
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                    Criar Nova Avaliação • <span className="font-semibold text-green-600 dark:text-green-400">Análise Avançada</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <span className="font-semibold text-green-700 dark:text-green-300">Selecionar Aluno</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 font-bold text-sm">2</span>
                  </div>
                  <span className="text-gray-500">Capturar Fotos</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 font-bold text-sm">3</span>
                  </div>
                  <span className="text-gray-500">Análise IA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-green-600 dark:text-green-400 text-sm font-semibold">Alunos Disponíveis</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{students.length}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full w-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold">Seleção</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent ? '✓' : '—'}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className={`bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ${selectedStudent ? 'w-full' : 'w-0'}`}></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-purple-600 dark:text-purple-400 text-sm font-semibold">Status</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent ? 'Pronto' : 'Aguard.'}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className={`bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ${selectedStudent ? 'w-full' : 'w-0'}`}></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Selection Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
          <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Selecionar Aluno</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                    Escolha um aluno para criar uma nova avaliação postural
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Search Bar */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Buscar Aluno
                </Label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl blur opacity-50"></div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600 dark:text-green-400" />
                    <Input
                      placeholder="Digite o nome do aluno..."
                      className="pl-12 h-12 text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Student Selection */}
              <div className="space-y-3">
                <Label htmlFor="student" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Aluno *
                </Label>
                <Select
                  value={selectedStudent}
                  onValueChange={setSelectedStudent}
                >
                  <SelectTrigger className="h-14 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all text-lg">
                    <SelectValue placeholder="Selecione um aluno da lista" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl max-h-60">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <SelectItem 
                          key={student.id} 
                          value={student.id}
                          className="rounded-xl p-3 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-medium">{student.full_name}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Nenhum aluno encontrado
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selecione o aluno que receberá a avaliação postural
                </p>
              </div>

              {/* Selected Student Preview */}
              {selectedStudentData && (
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/50">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-900 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-green-800 dark:text-green-300">
                        Aluno Selecionado
                      </h3>
                      <p className="text-green-600 dark:text-green-400 font-medium">
                        {selectedStudentData.full_name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  variant="outline" 
                  onClick={() => router.back()}
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreate} 
                  disabled={isLoading || !selectedStudent}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Criando Avaliação...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-5 w-5" />
                      Criar Avaliação Postural
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Camera className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Fotos Posturais</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Capture fotos frontais, laterais e posteriores para análise completa
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Análise IA</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Inteligência artificial analisa automaticamente desvios posturais
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Recomendações</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Receba sugestões personalizadas de exercícios corretivos
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}