// Update useEffect to include fetchWorkouts in dependencies
useEffect(() => {
  fetchWorkouts();
}, [fetchWorkouts]);

// Move fetchWorkouts inside useCallback
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