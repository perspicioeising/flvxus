import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Activity, 
  Camera, 
  Image, 
  Sparkles, 
  Zap,
  Trophy,
  Calendar,
  Target
} from "lucide-react";

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

interface TabConfig {
  id: string;
  label: string;
  icon: any;
  color: string;
  count?: number;
  description: string;
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

  const tabsConfig: TabConfig[] = [
    {
      id: 'profile',
      label: 'Perfil',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      description: 'Informações pessoais'
    },
    {
      id: 'physical',
      label: 'Avaliações Físicas',
      icon: Activity,
      color: 'from-emerald-500 to-emerald-600',
      count: physicalAssessments.length,
      description: 'Composição corporal'
    },
    {
      id: 'postural',
      label: 'Avaliações Posturais',
      icon: Camera,
      color: 'from-purple-500 to-purple-600',
      count: posturalAssessments.length,
      description: 'Análise postural'
    },
    {
      id: 'media',
      label: 'Mídia',
      icon: Image,
      color: 'from-orange-500 to-orange-600',
      count: mediaFiles.length,
      description: 'Fotos e documentos'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Modern Tab Navigation */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-blue-500/10 to-blue-600/10 rounded-3xl blur-2xl"></div>
        <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          <CardContent className="p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {tabsConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isLoading = loadingStates[tab.id as keyof typeof loadingStates];
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    disabled={isLoading}
                    className={`relative group p-6 rounded-2xl transition-all duration-500 transform hover:scale-105 ${
                      isActive 
                        ? 'scale-105' 
                        : 'hover:scale-105'
                    }`}
                  >
                    {/* Background Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-2xl blur-xl opacity-0 ${
                      isActive ? 'opacity-100' : 'group-hover:opacity-100'
                    } transition-opacity duration-500`}></div>
                    
                    {/* Card Background */}
                    <div className={`relative p-6 rounded-2xl border-2 transition-all duration-500 ${
                      isActive
                        ? `bg-gradient-to-br ${tab.color} text-white border-transparent shadow-2xl`
                        : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-lg hover:shadow-xl'
                    }`}>
                      
                      {/* Icon Section */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${
                          isActive 
                            ? 'bg-white/20 backdrop-blur-sm' 
                            : `bg-gradient-to-br ${tab.color} shadow-lg`
                        }`}>
                          <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-white'}`} />
                        </div>
                        
                        {/* Count Badge */}
                        {tab.count !== undefined && (
                          <Badge className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isActive
                              ? 'bg-white/20 text-white border-white/30'
                              : `bg-gradient-to-r ${tab.color} text-white border-0`
                          }`}>
                            {tab.count}
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <div className="text-left">
                        <h3 className={`font-bold text-lg mb-2 ${
                          isActive ? 'text-white' : 'text-gray-900 dark:text-white'
                        }`}>
                          {tab.label}
                        </h3>
                        <p className={`text-sm ${
                          isActive ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {tab.description}
                        </p>
                      </div>

                      {/* Loading State */}
                      {isLoading && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                          <div className="relative">
                            <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
                            <div className="absolute inset-0 w-8 h-8 border-4 border-transparent rounded-full animate-ping border-t-blue-400 dark:border-t-blue-500"></div>
                          </div>
                        </div>
                      )}

                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                          <Sparkles className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Content */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-0">
          {loadingStates.profile ? (
            <TabContentLoading icon={User} title="Carregando perfil..." />
          ) : (
            <ProfileTab 
              student={student} 
              onStudentUpdate={onStudentUpdate} 
            />
          )}
        </TabsContent>

        {/* Physical Assessments Tab */}
        <TabsContent value="physical" className="mt-0">
          {loadingStates.physical ? (
            <TabContentLoading icon={Activity} title="Carregando avaliações físicas..." />
          ) : (
            <PhysicalAssessmentsTab 
              assessments={physicalAssessments}
              studentId={studentId}
            />
          )}
        </TabsContent>

        {/* Postural Assessments Tab */}
        <TabsContent value="postural" className="mt-0">
          {loadingStates.postural ? (
            <TabContentLoading icon={Camera} title="Carregando avaliações posturais..." />
          ) : (
            <PosturalAssessmentsTab 
              assessments={posturalAssessments}
              studentId={studentId}
            />
          )}
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="mt-0">
          {loadingStates.media ? (
            <TabContentLoading icon={Image} title="Carregando arquivos..." />
          ) : (
            <MediaTab 
              mediaFiles={mediaFiles}
              studentId={studentId}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente de Loading para conteúdo da tab
function TabContentLoading({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-blue-500/10 to-blue-600/10 rounded-3xl blur-2xl"></div>
      <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
        <CardContent className="p-16 text-center">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Icon className="h-10 w-10 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-blue-600/30 rounded-2xl blur-xl animate-pulse"></div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
          
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}