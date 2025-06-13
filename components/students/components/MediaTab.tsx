import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image, Upload, Download, Trash2, Eye, FileImage, FileVideo, File } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MediaTabProps {
  mediaFiles: any[];
  studentId: string;
}

export function MediaTab({ mediaFiles, studentId }: MediaTabProps) {
  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) return FileImage;
    if (fileType?.startsWith('video/')) return FileVideo;
    return File;
  };

  const getFileTypeColor = (fileType: string) => {
    if (fileType?.startsWith('image/')) return 'from-blue-500 to-blue-600';
    if (fileType?.startsWith('video/')) return 'from-purple-500 to-purple-600';
    return 'from-gray-500 to-gray-600';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-blue-500/10 to-blue-600/10 rounded-2xl blur-xl"></div>
      <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Image className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Arquivos de Mídia
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Fotos, vídeos e documentos compartilhados pelo aluno
                </CardDescription>
              </div>
            </div>
            
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-semibold border-0 shrink-0">
              <Upload className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Fazer Upload</span>
              <span className="sm:hidden">Upload</span>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {mediaFiles.length > 0 ? (
              <>
                {/* File Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <FileImage className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">
                          Imagens
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {mediaFiles.filter(f => f.file_type?.startsWith('image/')).length}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <FileVideo className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase tracking-wider">
                          Vídeos
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {mediaFiles.filter(f => f.file_type?.startsWith('video/')).length}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <File className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase tracking-wider">
                          Total
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {mediaFiles.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Files Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mediaFiles.map((file: any) => {
                    const FileIcon = getFileIcon(file.file_type);
                    const colorClass = getFileTypeColor(file.file_type);
                    
                    return (
                      <Card key={file.id} className="group bg-white dark:bg-gray-900/70 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm hover:shadow-md rounded-xl overflow-hidden">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* File icon and type */}
                            <div className="flex items-center justify-between">
                              <div className={`p-3 bg-gradient-to-r ${colorClass} rounded-xl`}>
                                <FileIcon className="h-6 w-6 text-white" />
                              </div>
                              
                              {file.is_shared && (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-600 text-xs">
                                  Compartilhado
                                </Badge>
                              )}
                            </div>
                            
                            {/* File info */}
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                {file.file_name}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {file.file_size && formatFileSize(file.file_size)} • {' '}
                                {format(new Date(file.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                              </p>
                            </div>
                            
                            {/* Preview (for images) */}
                            {file.file_type?.startsWith('image/') && file.file_url && (
                              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                <img 
                                  src={file.file_url} 
                                  alt={file.file_name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                            
                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Ver
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white/80 dark:bg-gray-800/80 border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="relative mb-8">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center shadow-lg">
                    <Image className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-full blur-2xl animate-pulse"></div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Nenhum arquivo de mídia encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Os arquivos compartilhados pelo aluno aparecerão aqui. Você pode fazer upload de novos arquivos.
                </p>
                
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-semibold border-0">
                  <Upload className="mr-2 h-5 w-5" />
                  Fazer Upload
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}