"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupabase } from "@/app/providers";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek, eachDayOfInterval, addHours, isSameDay, isSameHour } from "date-fns";
import { Plus, ChevronLeft, ChevronRight, Clock, CalendarIcon, Zap, Target, Users, TrendingUp, User, Save, X } from "lucide-react";
import { ptBR } from "date-fns/locale";

// Mock data for demonstration
const MOCK_STUDENTS = [
  { id: "1", name: "Maria Silva" },
  { id: "2", name: "João Santos" },
  { id: "3", name: "Ana Costa" },
  { id: "4", name: "Carlos Oliveira" },
  { id: "5", name: "Juliana Mendes" },
];

const MOCK_APPOINTMENTS = [
  {
    id: "1",
    title: "Personal Training Session",
    studentId: "1",
    studentName: "Maria Silva",
    date: new Date(2025, 0, 15, 9, 0), // Jan 15, 2025, 9:00 AM
    endDate: new Date(2025, 0, 15, 10, 0), // Jan 15, 2025, 10:00 AM
    status: "scheduled"
  },
  {
    id: "2",
    title: "Assessment",
    studentId: "2",
    studentName: "João Santos",
    date: new Date(2025, 0, 15, 11, 30), // Jan 15, 2025, 11:30 AM
    endDate: new Date(2025, 0, 15, 12, 30), // Jan 15, 2025, 12:30 PM
    status: "scheduled"
  },
  {
    id: "3",
    title: "Personal Training Session",
    studentId: "3",
    studentName: "Ana Costa",
    date: new Date(2025, 0, 16, 14, 0), // Jan 16, 2025, 2:00 PM
    endDate: new Date(2025, 0, 16, 15, 0), // Jan 16, 2025, 3:00 PM
    status: "scheduled"
  },
  {
    id: "4",
    title: "Postural Assessment",
    studentId: "4",
    studentName: "Carlos Oliveira",
    date: new Date(2025, 0, 17, 10, 0), // Jan 17, 2025, 10:00 AM
    endDate: new Date(2025, 0, 17, 11, 0), // Jan 17, 2025, 11:00 AM
    status: "scheduled"
  },
  {
    id: "5",
    title: "Nutrition Consultation",
    studentId: "5",
    studentName: "Juliana Mendes",
    date: new Date(2025, 0, 18, 16, 0), // Jan 18, 2025, 4:00 PM
    endDate: new Date(2025, 0, 18, 17, 0), // Jan 18, 2025, 5:00 PM
    status: "scheduled"
  }
];

export default function CalendarPage() {
  const { supabase, session } = useSupabase();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false);

  // Replace this with the actual user's ID from session
  const trainerId = session?.user?.id || "trainer-1";

  const [newAppointment, setNewAppointment] = useState({
    title: "",
    studentId: "",
    date: "",
    time: "",
    duration: "60",
    description: "",
  });

  // Calculate the start of the current week
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 0 });

  // Generate array of dates for the current week view
  const daysOfWeek = eachDayOfInterval({
    start: startOfCurrentWeek,
    end: addDays(startOfCurrentWeek, 6),
  });

  // Filter appointments for the current week
  const weekAppointments = MOCK_APPOINTMENTS.filter(appointment =>
    appointment.date >= startOfCurrentWeek &&
    appointment.date <= addDays(startOfCurrentWeek, 6)
  );

  const previousWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, -7));
  };

  const nextWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, 7));
  };

  const handleAddAppointment = async () => {
    try {
      const appointmentDate = new Date(`${newAppointment.date}T${newAppointment.time}`);
      const endDate = new Date(appointmentDate.getTime() + parseInt(newAppointment.duration) * 60000);

      // In a real implementation, we would add the appointment to the database

      toast({
        title: "Compromisso agendado",
        description: `Appointment with ${MOCK_STUDENTS.find(s => s.id === newAppointment.studentId)?.name} has been scheduled`,
      });

      setIsAddAppointmentOpen(false);
      setNewAppointment({
        title: "",
        studentId: "",
        date: "",
        time: "",
        duration: "60",
        description: "",
      });

      // Refresh appointments (in real implementation)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao agendar compromisso",
        description: error.message || "Ocorreu um erro",
      });
    }
  };

  // Find appointments for a specific day and time slot
  const getAppointmentForTimeSlot = (day: Date, timeSlot: Date) => {
    return weekAppointments.find(appointment =>
      isSameDay(appointment.date, day) &&
      appointment.date.getHours() === timeSlot.getHours() &&
      appointment.date.getMinutes() === timeSlot.getMinutes()
    );
  };

  // Handle click on an appointment (placeholder)
  const handleAppointmentClick = (appointment: typeof MOCK_APPOINTMENTS[number]) => {
    toast({
      title: "Detalhes do Compromisso",
      description: `Título: ${appointment.title}\nAluno: ${appointment.studentName}\nHorário: ${format(appointment.date, "HH:mm")} - ${format(appointment.endDate, "HH:mm")}`,
    });
  };

  // Calculate statistics
  const totalAppointments = weekAppointments.length;
  const todayAppointments = weekAppointments.filter(apt => isSameDay(apt.date, new Date())).length;
  const uniqueStudents = new Set(weekAppointments.map(apt => apt.studentId)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Ultra Modern Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-600/20 dark:from-green-500/10 dark:via-emerald-400/10 dark:to-teal-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <CalendarIcon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-600 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white bg-clip-text text-transparent">
                      Calendário
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                      <span className="font-semibold text-green-600 dark:text-green-400">Gestão Completa</span> • Compromissos e Sessões
                    </p>
                  </div>
                </div>
              </div>

              <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
                <DialogTrigger asChild>
                  <Button className="group bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 border-0">
                    <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                    Novo Compromisso
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-green-200/50 dark:border-green-800/30 rounded-3xl shadow-2xl max-w-2xl">
                  <DialogHeader className="pb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                        <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Agendar Novo Compromisso</DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400 text-lg">
                          Crie um novo compromisso ou sessão com um aluno
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="space-y-3">
                      <Label htmlFor="title" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Título *</Label>
                      <Input
                        id="title"
                        placeholder="ex.: Sessão de Treino Personalizado"
                        value={newAppointment.title}
                        onChange={(e) => setNewAppointment(prev => ({ ...prev, title: e.target.value }))}
                        className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="student" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Aluno *</Label>
                      <Select
                        value={newAppointment.studentId}
                        onValueChange={(value) => setNewAppointment(prev => ({ ...prev, studentId: value }))}
                      >
                        <SelectTrigger id="student" className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                          <SelectValue placeholder="Selecione um aluno" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                          {MOCK_STUDENTS.map((student) => (
                            <SelectItem key={student.id} value={student.id} className="rounded-xl">
                              <div className="flex items-center gap-3">
                                <User className="h-4 w-4" />
                                {student.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="date" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Data *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newAppointment.date}
                          onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                          className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="time" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Horário *</Label>
                        <Input
                          id="time"
                          type="time"
                          value={newAppointment.time}
                          onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                          className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="duration" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Duração *</Label>
                      <Select
                        value={newAppointment.duration}
                        onValueChange={(value) => setNewAppointment(prev => ({ ...prev, duration: value }))}
                      >
                        <SelectTrigger id="duration" className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                          <SelectValue placeholder="Selecione a duração" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 dark:bg-gray-900/95 border-0 rounded-xl shadow-2xl backdrop-blur-xl">
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="60">60 minutos</SelectItem>
                          <SelectItem value="90">90 minutos</SelectItem>
                          <SelectItem value="120">120 minutos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Descrição (opcional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Adicione notas ou instruções adicionais para o compromisso..."
                        value={newAppointment.description}
                        onChange={(e) => setNewAppointment(prev => ({ ...prev, description: e.target.value }))}
                        className="min-h-[100px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 transition-all resize-none"
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-4 pt-6">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddAppointmentOpen(false)}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleAddAppointment}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Agendar Compromisso
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <CalendarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-green-600 dark:text-green-400 text-sm font-semibold">Esta Semana</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalAppointments}</p>
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
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold">Hoje</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayAppointments}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((todayAppointments / Math.max(totalAppointments, 1)) * 100, 100)}%` }}
                  ></div>
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
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-purple-600 dark:text-purple-400 text-sm font-semibold">Alunos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{uniqueStudents}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((uniqueStudents / MOCK_STUDENTS.length) * 100, 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative border-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-orange-600 dark:text-orange-400 text-sm font-semibold">Taxa</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">98%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full w-[98%]"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Calendar Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-green-600/10 rounded-2xl blur-xl"></div>
          <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl">
            <CardHeader className="pb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <CalendarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Calendário de Compromissos</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                      Visualize e gerencie seus compromissos agendados
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={previousWeek}
                    className="h-12 w-12 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg backdrop-blur-sm">
                    {format(startOfCurrentWeek, "MMM d", { locale: ptBR })} - {format(addDays(startOfCurrentWeek, 6), "MMM d, yyyy", { locale: ptBR })}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextWeek}
                    className="h-12 w-12 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Week Days Header */}
              <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 mb-4">
                {daysOfWeek.map((day, index) => (
                  <div
                    key={index}
                    className={`p-4 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0 transition-all duration-300 ${
                      isSameDay(day, new Date()) 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' 
                        : ''
                    }`}
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                      {format(day, "EEE", { locale: ptBR })}
                    </div>
                    <div className={`font-bold text-lg ${
                      isSameDay(day, new Date()) 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {format(day, "d")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="relative min-h-[600px]">
                {/* Time markers */}
                <div className="absolute top-0 left-0 w-16 h-full border-r border-gray-200 dark:border-gray-700">
                  {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(hour => (
                    <div
                      key={hour}
                      className="h-20 flex items-start justify-center pt-2 text-sm font-semibold text-gray-600 dark:text-gray-400"
                    >
                      {hour === 12 ? '12h' : `${hour}h`}
                    </div>
                  ))}
                </div>

                {/* Main calendar grid */}
                <div className="ml-16 grid grid-cols-7 h-full">
                  {daysOfWeek.map((day, dayIndex) => (
                    <div key={dayIndex} className="border-r border-gray-200 dark:border-gray-700 last:border-r-0 relative">
                      {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(hour => {
                        const timeSlot = new Date(day.setHours(hour, 0, 0, 0));
                        const appointment = getAppointmentForTimeSlot(day, timeSlot);

                        return (
                          <div
                            key={hour}
                            className={`h-10 border-b border-gray-200 dark:border-gray-700 transition-all duration-200 ${
                              isSameHour(new Date(), timeSlot) && isSameDay(new Date(), day)
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                          >
                            {appointment && (
                              <div
                                className="absolute inset-x-1 bg-gradient-to-r from-green-500/90 to-emerald-500/90 backdrop-blur-sm border-l-4 border-green-600 dark:border-green-400 rounded-lg px-3 py-2 overflow-hidden text-xs hover:from-green-600/90 hover:to-emerald-600/90 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl group"
                                onClick={() => handleAppointmentClick(appointment)}
                              >
                                <div className="font-bold text-white truncate group-hover:scale-105 transition-transform duration-200">
                                  {appointment.title}
                                </div>
                                <div className="flex items-center text-green-100 gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  <span className="font-medium">
                                    {format(appointment.date, "HH:mm")} - {format(appointment.endDate, "HH:mm")}
                                  </span>
                                </div>
                                <div className="text-green-100 truncate font-medium">
                                  {appointment.studentName}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Half hour slots */}
                      {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(hour => {
                        const timeSlot = new Date(day.setHours(hour, 30, 0, 0));
                        const appointment = getAppointmentForTimeSlot(day, timeSlot);

                        return (
                          <div
                            key={`${hour}-30`}
                            className={`h-10 border-b border-dashed border-gray-200 dark:border-gray-700 transition-all duration-200 ${
                              isSameHour(new Date(), timeSlot) && isSameDay(new Date(), day)
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                          >
                            {appointment && (
                              <div
                                className="absolute inset-x-1 bg-gradient-to-r from-blue-500/90 to-cyan-500/90 backdrop-blur-sm border-l-4 border-blue-600 dark:border-blue-400 rounded-lg px-3 py-2 overflow-hidden text-xs hover:from-blue-600/90 hover:to-cyan-600/90 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl group"
                                onClick={() => handleAppointmentClick(appointment)}
                              >
                                <div className="font-bold text-white truncate group-hover:scale-105 transition-transform duration-200">
                                  {appointment.title}
                                </div>
                                <div className="flex items-center text-blue-100 gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  <span className="font-medium">
                                    {format(appointment.date, "HH:mm")} - {format(appointment.endDate, "HH:mm")}
                                  </span>
                                </div>
                                <div className="text-blue-100 truncate font-medium">
                                  {appointment.studentName}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <CalendarIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Agendamento Fácil</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Sistema intuitivo para agendar sessões e compromissos com seus alunos
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Gestão de Tempo</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Visualize sua agenda semanal e otimize seu tempo de forma eficiente
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Acompanhamento</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Monitore o progresso dos alunos através de sessões regulares
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}