// Update useEffect to include dependencies
useEffect(() => {
  fetchWorkoutPlans();
  fetchWorkouts();
  fetchStudents();
}, [fetchWorkoutPlans, fetchWorkouts, fetchStudents]);

// Move fetch functions inside useCallback
const fetchWorkoutPlans = useCallback(async () => {
  try {
    const response = await fetch('/api/workout-plans');
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error);
    }
    
    setPlans(data);
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error fetching workout plans",
      description: error.message,
    });
  }
}, [toast]);

const fetchWorkouts = useCallback(async () => {
  try {
    const response = await fetch('/api/workouts');
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error);
    }
    
    setWorkouts(data);
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error fetching workouts",
      description: error.message,
    });
  }
}, [toast]);

const fetchStudents = useCallback(async () => {
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
      title: "Error fetching students",
      description: error.message,
    });
  }
}, [toast]);