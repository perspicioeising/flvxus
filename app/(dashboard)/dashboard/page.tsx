'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Users,
  Calendar,
  Dumbbell,
  TrendingUp,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your training business and student progress.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Workouts</CardTitle>
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  +3 new this week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">
                  For the next 7 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">86%</div>
                <p className="text-xs text-muted-foreground">
                  +2.5% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest student activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    id: 1,
                    student: "Maria Silva",
                    action: "Completed workout",
                    workout: "Upper Body Strength",
                    time: "2 hours ago",
                    progress: 100,
                  },
                  {
                    id: 2,
                    student: "João Santos",
                    action: "Started workout",
                    workout: "Leg Day",
                    time: "5 hours ago",
                    progress: 45,
                  },
                  {
                    id: 3,
                    student: "Carlos Oliveira",
                    action: "Scheduled session",
                    workout: "Assessment",
                    time: "Yesterday",
                    progress: 0,
                  },
                  {
                    id: 4,
                    student: "Ana Costa",
                    action: "Missed workout",
                    workout: "Core Training",
                    time: "2 days ago",
                    progress: 0,
                  },
                ].map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {activity.action.includes("Completed") ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : activity.action.includes("Started") ? (
                        <Activity className="h-5 w-5 text-blue-500" />
                      ) : activity.action.includes("Scheduled") ? (
                        <Calendar className="h-5 w-5 text-purple-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{activity.student}</p>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {activity.action}: <span className="font-medium">{activity.workout}</span>
                      </p>
                      {activity.action.includes("Started") && (
                        <Progress value={activity.progress} className="h-1.5 mt-1.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Progress</CardTitle>
              <CardDescription>Average student performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex justify-center items-center text-muted-foreground">
              Analytics charts will appear here, showing progress over time
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Schedule</CardTitle>
              <CardDescription>Your next 7 days of appointments and sessions</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex justify-center items-center text-muted-foreground">
              Calendar view will appear here, showing your upcoming schedule
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}