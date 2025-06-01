'use client';

import React, { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSupabase } from "@/app/providers";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trophy, Target, Dumbbell, Calendar, BarChart, Award, Star, Trash2 } from "lucide-react";

const CRITERIA_TYPES = [
  { value: "workouts_completed", label: "Workouts Completed", icon: Dumbbell },
  { value: "consecutive_days", label: "Consecutive Days", icon: Calendar },
  { value: "total_weight", label: "Total Weight Lifted", icon: BarChart },
  { value: "exercises_completed", label: "Exercises Completed", icon: Target },
];

export default function AchievementsPage() {
  const router = useRouter();
  const { supabase, session } = useSupabase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingAchievement, setIsAddingAchievement] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userRole, setUserRole] = useState(null);
  const [userAchievements, setUserAchievements] = useState([]);
  
  const [newAchievement, setNewAchievement] = useState({
    name: "",
    description: "",
    criteria_type: "",
    criteria_value: "",
    points_reward: "",
    icon: "trophy"
  });

  useEffect(() => {
    fetchUserRole();
    fetchAchievements();
  }, []);

  const fetchUserRole = async () => {
    try {
      if (!session || !session.user) {
        setUserRole(null);
        return;
      }
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      setUserRole(profile.role);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setAchievements(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching achievements",
        description: error.message,
      });
    }
  };

  const handleAddAchievement = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAchievement),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Achievement created",
        description: "New achievement has been added successfully",
      });
      
      setIsAddingAchievement(false);
      setNewAchievement({
        name: "",
        description: "",
        criteria_type: "",
        criteria_value: "",
        points_reward: "",
        icon: "trophy"
      });
      
      fetchAchievements();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating achievement",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/achievements/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Achievement deleted",
        description: "The achievement has been removed",
      });
      
      fetchAchievements();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting achievement",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  interface Achievement {
    id: string;
    name: string;
    description: string;
    criteria_type: string;
    criteria_value: string;
    points_reward: string;
    icon: string;
  }

  interface Progress {
    [achievementId: string]: number;
  }

  const getProgressForAchievement = (achievement: Achievement): number => {
    // This would be replaced with actual progress data from the backend
    return Math.floor(Math.random() * 100);
  };

  interface CriteriaType {
    value: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }

  interface RenderAchievementIconProps {
    criteriaType: string;
  }

  const renderAchievementIcon = (criteriaType: string): JSX.Element | null => {
    const IconComponent = CRITERIA_TYPES.find((t: CriteriaType) => t.value === criteriaType)?.icon;
    if (!IconComponent) return null;
    return (
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
        <IconComponent className="h-6 w-6 text-primary" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Achievements</h2>
          <p className="text-muted-foreground">
            {userRole === 'trainer' 
              ? 'Manage achievements and rewards for your students'
              : 'Track your progress and earn rewards'}
          </p>
        </div>
        {userRole === 'trainer' && (
          <Dialog open={isAddingAchievement} onOpenChange={setIsAddingAchievement}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Achievement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Achievement</DialogTitle>
                <DialogDescription>
                  Set up a new achievement for your students to earn
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Achievement Name</Label>
                  <Input
                    placeholder="e.g., Workout Warrior"
                    value={newAchievement.name}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe how to earn this achievement..."
                    value={newAchievement.description}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Criteria Type</Label>
                    <Select
                      value={newAchievement.criteria_type}
                      onValueChange={(value) => setNewAchievement(prev => ({ ...prev, criteria_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CRITERIA_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Value</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      value={newAchievement.criteria_value}
                      onChange={(e) => setNewAchievement(prev => ({ ...prev, criteria_value: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Points Reward</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    value={newAchievement.points_reward}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, points_reward: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingAchievement(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAchievement} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Achievement"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6">
        {userRole === 'student' && (
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>
                Track your fitness journey and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-primary/10 text-center">
                  <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">1,250</div>
                  <div className="text-sm text-muted-foreground">Total Points</div>
                </div>
                <div className="p-4 rounded-lg bg-muted text-center">
                  <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-sm text-muted-foreground">Achievements Earned</div>
                </div>
                <div className="p-4 rounded-lg bg-muted text-center">
                  <Star className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">Silver</div>
                  <div className="text-sm text-muted-foreground">Current Rank</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <Card key={achievement.id} className="relative group">
              {userRole === 'trainer' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteAchievement(achievement.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  {renderAchievementIcon(achievement.criteria_type)}
                  <h3 className="font-semibold text-lg mb-1">{achievement.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {achievement.description}
                  </p>
                </div>

                {userRole === 'student' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{getProgressForAchievement(achievement)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${getProgressForAchievement(achievement)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <Badge variant="outline" className="bg-primary/5">
                        {achievement.points_reward} points
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {achievement.criteria_value} {achievement.criteria_type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                )}

                {userRole === 'trainer' && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="bg-primary/5">
                        {achievement.points_reward} points
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {achievement.criteria_value} {achievement.criteria_type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}