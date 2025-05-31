// Update useEffect to include fetchStudents in dependencies
useEffect(() => {
  fetchStudents();
}, [fetchStudents]);

// Move fetchStudents inside useCallback
const fetchStudents = useCallback(async () => {
  try {
    const response = await fetch('/api/students');
    const data = await response.json();
    if (response.ok) {
      setStudents(data);
    } else {
      throw new Error(data.error);
    }
  } catch (error: any) {
    toast({
      variant: "destructive",
      title: "Error fetching students",
      description: error.message,
    });
  }
}, [toast]);

// Fix unescaped apostrophe
<span className="text-muted-foreground">Don&apos;t have an account? </span>