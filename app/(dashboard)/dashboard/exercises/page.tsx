// Update useEffect to include fetchExercises in dependencies
useEffect(() => {
  fetchExercises();
}, [fetchExercises]);

// Move fetchExercises inside useCallback
const fetchExercises = useCallback(async () => {
  try {
    const response = await fetch('/api/exercises');
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error);
    }
    
    setExercises(data);
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error fetching exercises",
      description: error.message,
    });
  }
}, [toast]);