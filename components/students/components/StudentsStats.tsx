import { Card, CardContent } from "@/components/ui/card";
import { User, TrendingUp, CalendarDays, Users } from "lucide-react";
import { Student } from '@/types/student';

interface StudentsStatsProps {
  students: Student[];
}

export function StudentsStats({ students }: StudentsStatsProps) {
  const activeStudents = students.filter(s => s.status === 'active').length;
  const newThisMonth = students.filter(s => {
    const createdDate = new Date(s.created_at);
    const currentDate = new Date();
    return createdDate.getMonth() === currentDate.getMonth() &&
           createdDate.getFullYear() === currentDate.getFullYear();
  }).length;

  const stats = [
    {
      value: students.length,
      label: "Total",
      color: "from-blue-600 to-purple-600",
      icon: Users,
      progress: 100,
      shortLabel: true
    },
    {
      value: activeStudents,
      label: "Ativos",
      color: "from-green-600 to-emerald-600",
      icon: TrendingUp,
      progress: students.length > 0 ? (activeStudents / students.length) * 100 : 0,
      shortLabel: true
    },
    {
      value: newThisMonth,
      label: "Este Mês",
      color: "from-orange-600 to-red-600",
      icon: CalendarDays,
      progress: students.length > 0 ? Math.min((newThisMonth / students.length) * 100, 100) : 0,
      shortLabel: true
    },
    {
      value: `${students.length > 0 ? Math.round((activeStudents / students.length) * 100) : 0}`,
      label: "Taxa Atividade",
      color: "from-purple-600 to-pink-600",
      icon: User,
      progress: students.length > 0 ? (activeStudents / students.length) * 100 : 0,
      suffix: "%",
      shortLabel: false
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4">
      {stats.map((metric, index) => {
        const Icon = metric.icon;

        return (
          <div key={index} className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} rounded-xl sm:rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
            <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-xl sm:rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02] h-full flex flex-col">
              <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl"></div>

              <CardContent className="relative p-3 sm:p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm font-bold uppercase tracking-wider truncate ${
                      metric.color.includes('blue') ? 'text-blue-600 dark:text-blue-400' :
                      metric.color.includes('green') ? 'text-green-600 dark:text-green-400' :
                      metric.color.includes('orange') ? 'text-orange-600 dark:text-orange-400' :
                      'text-purple-600 dark:text-purple-400'
                    }`}>
                      {metric.label}
                    </p>
                  </div>
                  <div className={`p-2 sm:p-3 bg-gradient-to-br ${metric.color} rounded-lg sm:rounded-xl shadow-lg flex-shrink-0`}>
                    <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>

                <div className="mt-auto">
                  <p className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white mb-2 sm:mb-3">
                    {metric.value}{metric.suffix || ''}
                  </p>
                  <div className="h-1 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${Math.min(metric.progress, 100)}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}