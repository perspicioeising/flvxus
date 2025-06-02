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
import { Plus, ChevronLeft, ChevronRight, Clock, CalendarIcon } from "lucide-react";
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

// Helper function to generate time slots for a day
const generateTimeSlots = (date: Date) => {
  const slots = [];
  const startHour = 8; // 8 AM
  const endHour = 18; // 6 PM

  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push(addHours(new Date(date.setHours(hour, 0, 0, 0)), 0));
    slots.push(addHours(new Date(date.setHours(hour, 30, 0, 0)), 0));
  }

  return slots;
};

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

  return (
    <div className="space-y-6">
      {/* Cabeçalho Aprimorado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20 w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Calendário</h2>
                  <p className="text-muted-foreground">
                    Gerencie compromissos e sessões com seus alunos
                  </p>
                </div>
              </div>
            </div>

            <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
              <DialogTrigger asChild>
                <Button
                  className="h-full min-w-[90px] p-3 flex flex-col items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-6 w-6" />
                  <span className="text-xs">Adicionar</span>            </Button>
              </DialogTrigger>
              <DialogContent className="bg-background/95 backdrop-blur-sm border border-primary/20">
                <DialogHeader>
                  <DialogTitle>Agendar Novo Compromisso</DialogTitle>
                  <DialogDescription>
                    Crie um novo compromisso ou sessão com um aluno
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      placeholder="ex.: Sessão de Treino"
                      value={newAppointment.title}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-background/70 backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student">Aluno *</Label>
                    <Select
                      value={newAppointment.studentId}
                      onValueChange={(value) => setNewAppointment(prev => ({ ...prev, studentId: value }))}
                    >
                      <SelectTrigger id="student" className="bg-background/70 backdrop-blur-sm">
                        <SelectValue placeholder="Selecione um aluno" />
                      </SelectTrigger>
                      <SelectContent className="bg-background/90 backdrop-blur-sm border border-primary/20">
                        {MOCK_STUDENTS.map((student) => (
                          <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Data *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newAppointment.date}
                        onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                        className="bg-background/70 backdrop-blur-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Horário *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newAppointment.time}
                        onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                        className="bg-background/70 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração *</Label>
                    <Select
                      value={newAppointment.duration}
                      onValueChange={(value) => setNewAppointment(prev => ({ ...prev, duration: value }))}
                    >
                      <SelectTrigger id="duration" className="bg-background/70 backdrop-blur-sm">
                        <SelectValue placeholder="Selecione a duração" />
                      </SelectTrigger>
                      <SelectContent className="bg-background/90 backdrop-blur-sm border border-primary/20">
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                        <SelectItem value="90">90 minutos</SelectItem>
                        <SelectItem value="120">120 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição (opcional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Adicione notas ou instruções adicionais"
                      value={newAppointment.description}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-background/70 backdrop-blur-sm min-h-[100px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddAppointmentOpen(false)}
                    className="bg-background/70 backdrop-blur-sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddAppointment}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Agendar Compromisso
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Calendário */}
      <Card className="bg-background/60 backdrop-blur-sm border border-primary/20 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold">Calendário de Compromissos</CardTitle>
              <CardDescription className="text-muted-foreground">
                Veja e gerencie seus compromissos agendados
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={previousWeek}
                className="bg-background/70 backdrop-blur-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="font-medium text-sm bg-background/70 backdrop-blur-sm px-3 py-1 rounded-md">
                {format(startOfCurrentWeek, "MMM d")} - {format(addDays(startOfCurrentWeek, 6), "MMM d, yyyy")}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={nextWeek}
                className="bg-background/70 backdrop-blur-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 border-b border-primary/20">
            {daysOfWeek.map((day, index) => (
              <div
                key={index}
                className={`p-2 text-center border-r border-primary/20 last:border-r-0 ${isSameDay(day, new Date()) ? 'bg-primary/10' : ''
                  }`}
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {format(day, "EEE", { locale: ptBR })}
                </div>
                <div className={`font-semibold ${isSameDay(day, new Date()) ? 'text-primary' : ''
                  }`}>
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          {/* Grade do calendário */}
          <div className="relative min-h-[500px]">
            {/* Marcadores de hora */}
            <div className="absolute top-0 left-0 w-12 h-full border-r border-primary/20">
              {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(hour => (
                <div
                  key={hour}
                  className="h-20 flex items-start justify-center pt-1 text-xs text-muted-foreground"
                >
                  {hour === 12 ? '12h' : `${hour}h`}
                </div>
              ))}
            </div>

            {/* Grade principal */}
            <div className="ml-12 grid grid-cols-7 h-full">
              {daysOfWeek.map((day, dayIndex) => (
                <div key={dayIndex} className="border-r border-primary/20 last:border-r-0 relative">
                  {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(hour => {
                    const timeSlot = new Date(day.setHours(hour, 0, 0, 0));
                    const appointment = getAppointmentForTimeSlot(day, timeSlot);

                    return (
                      <div
                        key={hour}
                        className={`h-10 border-b border-primary/20 last:border-b-0 ${isSameHour(new Date(), timeSlot) ? 'bg-primary/5' : ''
                          }`}
                      >
                        {appointment && (
                          <div
                            className="absolute inset-x-1 bg-primary/10 border-l-4 border-primary rounded-sm px-2 py-1 overflow-hidden text-xs hover:bg-primary/20 transition-colors cursor-pointer"
                            onClick={() => handleAppointmentClick(appointment)}
                          >
                            <div className="font-medium truncate">{appointment.title}</div>
                            <div className="flex items-center text-muted-foreground gap-1">
                              <Clock className="h-3 w-3" />
                              {format(appointment.date, "HH:mm")} - {format(appointment.endDate, "HH:mm")}
                            </div>
                            <div className="truncate">{appointment.studentName}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Marcadores de meia hora */}
                  {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(hour => {
                    const timeSlot = new Date(day.setHours(hour, 30, 0, 0));
                    const appointment = getAppointmentForTimeSlot(day, timeSlot);

                    return (
                      <div
                        key={`${hour}-30`}
                        className={`h-10 border-b border-primary/20 last:border-b-0 border-dashed ${isSameHour(new Date(), timeSlot) ? 'bg-primary/5' : ''
                          }`}
                      >
                        {appointment && (
                          <div
                            className="absolute inset-x-1 bg-primary/10 border-l-4 border-primary rounded-sm px-2 py-1 overflow-hidden text-xs hover:bg-primary/20 transition-colors cursor-pointer"
                            onClick={() => handleAppointmentClick(appointment)}
                          >
                            <div className="font-medium truncate">{appointment.title}</div>
                            <div className="flex items-center text-muted-foreground gap-1">
                              <Clock className="h-3 w-3" />
                              {format(appointment.date, "HH:mm")} - {format(appointment.endDate, "HH:mm")}
                            </div>
                            <div className="truncate">{appointment.studentName}</div>
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
  );
}