export function StudentDetailsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-blue-400 dark:border-t-blue-500"></div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Carregando detalhes do aluno...
        </p>
      </div>
    </div>
  );
}