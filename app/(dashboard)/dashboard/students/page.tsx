'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSupabase } from "@/app/providers";
import { useToast } from "@/hooks/use-toast";

useEffect(() => {
  fetchStudents();
}, [fetchStudents]);

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

<span className="text-muted-foreground">Don&apos;t have an account? </span>