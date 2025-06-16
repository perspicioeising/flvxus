import { Card, CardContent } from "@/components/ui/card";
import { User, Sparkles, Zap } from "lucide-react";

export function StudentDetailsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Loading Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-blue-600/20 dark:from-blue-500/10 dark:via-blue-400/10 dark:to-blue-500/10 rounded-3xl blur-xl"></div>
          <Card className="relative border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
            <CardContent className="p-12 text-center">
              
              {/* Animated Avatar */}
              <div className="relative inline-flex items-center justify-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent animate-pulse"></div>
                  <User className="h-12 w-12 text-white relative z-10" />
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                
                <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}>
                  <Zap className="h-4 w-4 text-white" />
                </div>

                {/* Orbital Ring */}
                <div className="absolute inset-0 w-32 h-32 border-4 border-blue-300/30 dark:border-blue-600/30 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                <div className="absolute inset-2 w-28 h-28 border-2 border-blue-400/40 dark:border-blue-500/40 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
              </div>
              
              {/* Loading Progress Bars */}
              <div className="space-y-3 mt-8">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse" style={{ width: '40%', animationDelay: '0.5s' }}></div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse" style={{ width: '80%', animationDelay: '1s' }}></div>
                </div>
              </div>

              {/* Status Text */}
              <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 font-medium">
                Preparando interface...
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    </div>
  );
}