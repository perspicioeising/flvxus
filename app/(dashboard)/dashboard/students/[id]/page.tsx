// Update useEffect to include fetchStudentDetails in dependencies
useEffect(() => {
  fetchStudentDetails();
}, [fetchStudentDetails]);

// Move fetchStudentDetails inside useCallback
const fetchStudentDetails = useCallback(async () => {
  try {
    const response = await fetch(`/api/students/${params.id}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error);
    }

    setStudent({
      name: data.full_name || "",
      email: data.email || "",
      phone: data.phone || "",
      birthDate: data.birth_date || "",
      gender: data.gender || "",
      height: data.height?.toString() || "",
      weight: data.weight?.toString() || "",
      goals: data.goals || [],
      medicalConditions: data.medical_conditions || "",
      emergencyContact: data.emergency_contact || "",
      preferredTime: data.preferred_training_time || "",
      experienceLevel: data.experience_level || "",
      notes: data.notes || "",
      status: data.status || "active"
    });
  } catch (error: any) {
    toast({
      variant: "destructive",
      title: "Error fetching student details",
      description: error.message,
    });
  } finally {
    setIsLoading(false);
  }
}, [params.id, toast]);

// Fix unescaped apostrophes
<Label htmlFor="medicalConditions">Medical Conditions</Label>
<Label htmlFor="emergencyContact">Emergency Contact</Label>
<Label htmlFor="preferredTime">Preferred Training Time</Label>