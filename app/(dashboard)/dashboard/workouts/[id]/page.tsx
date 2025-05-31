// Update useEffect to include fetchWorkoutDetails in dependencies
useEffect(() => {
  fetchWorkoutDetails();
}, [fetchWorkoutDetails]);

// Move fetchWorkoutDetails inside useCallback
const fetchWorkoutDetails = useCallback(async () => {
  try {
    const response = await fetch(`/api/workouts/${params.id}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error);
    }
    
    setWorkout({
      name: data.name,
      description: data.description || "",
      level: data.level,
      goal: data.goal,
      exercises: []
    });

    setSelectedExercises(
      data.workout_exercises?.map(we => ({
        ...we.exercise,
        sets: we.sets,
        reps: we.reps,
        rest: we.rest,
        notes: we.notes || ""
      })) || []
    );
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error fetching workout details",
      description: error.message,
    });
  }
}, [params.id, toast]);