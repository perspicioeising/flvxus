export function TabLoading() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400 dark:border-t-blue-500 mx-auto"></div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Carregando...
        </p>
      </div>
    </div>
  );
}