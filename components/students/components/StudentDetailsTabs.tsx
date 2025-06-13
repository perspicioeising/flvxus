import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Activity, Camera, Image } from "lucide-react";

// Import dos componentes das tabs
import { ProfileTab } from './ProfileTab';
import { PhysicalAssessmentsTab } from './PhysicalAssessmentsTab';
import { PosturalAssessmentsTab } from './PosturalAssessmentsTab';
import { MediaTab } from './MediaTab';
import { TabLoading } from './TabLoading';

interface StudentDetailsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  student: any;
  onStudentUpdate: (updates: any) => void;
  physicalAssessments: any[];
  posturalAssessments: any[];
  mediaFiles: any[];
  loadingStates: {
    profile: boolean;
    physical: boolean;
    postural: boolean;
    media: boolean;
  };
  studentId: string;
}

export function StudentDetailsTabs({
  activeTab,
  onTabChange,
  student,
  onStudentUpdate,
  physicalAssessments,
  posturalAssessments,
  mediaFiles,
  loadingStates,
  studentId
}: StudentDetailsTabsProps) {
  return (
    <Tabs defaultValue="profile" value={activeTab} onValueChange={onTabChange}>
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-blue-500/10 to-blue-600/10 rounded-2xl blur-xl"></div>
        <TabsList className="relative grid w-full grid-cols-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl rounded-2xl p-2 border-0">
          <TabsTrigger
            value="profile"
            className="flex items-center gap-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger
            value="physical"
            className="flex items-center gap-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
          >
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Avaliações Físicas</span>
          </TabsTrigger>
          <TabsTrigger
            value="postural"
            className="flex items-center gap-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
          >
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Avaliações Posturais</span>
          </TabsTrigger>
          <TabsTrigger
            value="media"
            className="flex items-center gap-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
          >
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Mídia</span>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Profile Tab */}
      <TabsContent value="profile">
        {loadingStates.profile ? (
          <TabLoading />
        ) : (
          <ProfileTab 
            student={student} 
            onStudentUpdate={onStudentUpdate} 
          />
        )}
      </TabsContent>

      {/* Physical Assessments Tab */}
      <TabsContent value="physical">
        {loadingStates.physical ? (
          <TabLoading />
        ) : (
          <PhysicalAssessmentsTab 
            assessments={physicalAssessments}
            studentId={studentId}
          />
        )}
      </TabsContent>

      {/* Postural Assessments Tab */}
      <TabsContent value="postural">
        {loadingStates.postural ? (
          <TabLoading />
        ) : (
          <PosturalAssessmentsTab 
            assessments={posturalAssessments}
            studentId={studentId}
          />
        )}
      </TabsContent>

      {/* Media Tab */}
      <TabsContent value="media">
        {loadingStates.media ? (
          <TabLoading />
        ) : (
          <MediaTab 
            mediaFiles={mediaFiles}
            studentId={studentId}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}