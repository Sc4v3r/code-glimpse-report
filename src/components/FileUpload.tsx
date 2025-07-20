import { useCallback, useState } from 'react';
import { Upload, File, X, Folder, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';
import * as Tar from 'tar-js';

export interface ProcessedFile {
  name: string;
  content: string;
  path: string;
  originalFile?: File;
}

interface FileUploadProps {
  onFilesSelected: (files: ProcessedFile[]) => void;
  className?: string;
}

export const FileUpload = ({ onFilesSelected, className }: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    setIsProcessing(true);
    const processedFiles: ProcessedFile[] = [];
    
    for (const file of Array.from(files)) {
      if (file.name.endsWith('.zip')) {
        try {
          const zip = await JSZip.loadAsync(file);
          for (const [path, zipFile] of Object.entries(zip.files)) {
            if (!zipFile.dir) {
              const content = await zipFile.async('text');
              processedFiles.push({
                name: path.split('/').pop() || path,
                content,
                path,
                originalFile: file
              });
            }
          }
        } catch (error) {
          console.error('Error processing ZIP file:', error);
        }
      } else if (file.name.endsWith('.tar')) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const tarFiles = Tar.read(new Uint8Array(arrayBuffer));
          for (const tarFile of tarFiles) {
            if (tarFile.buffer) {
              const content = new TextDecoder().decode(tarFile.buffer);
              processedFiles.push({
                name: tarFile.name.split('/').pop() || tarFile.name,
                content,
                path: tarFile.name,
                originalFile: file
              });
            }
          }
        } catch (error) {
          console.error('Error processing TAR file:', error);
        }
      } else {
        const content = await file.text();
        processedFiles.push({
          name: file.name,
          content,
          path: file.name,
          originalFile: file
        });
      }
    }
    
    setSelectedFiles(processedFiles);
    onFilesSelected(processedFiles);
    setIsProcessing(false);
  }, [onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleFolderSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(files);
    }
  }, [processFiles]);

  const removeFile = useCallback((index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  }, [selectedFiles, onFilesSelected]);

  const clearAll = useCallback(() => {
    setSelectedFiles([]);
    onFilesSelected([]);
  }, [onFilesSelected]);

  return (
    <div className={cn("space-y-4", className)}>
      <Card
        className={cn(
          "relative border-2 border-dashed transition-all duration-200 hover:border-primary/50",
          isDragOver ? "border-primary bg-accent/20" : "border-border"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload your code files</h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop files, folders, or archives (ZIP/TAR) here
          </p>
          <div className="flex gap-2 mb-4">
            <div className="relative">
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.h,.hpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.dart,.vue,.html,.css,.scss,.sass,.less,.xml,.json,.md,.txt,.sql,.sh,.bat,.ps1,.yaml,.yml,.zip,.tar"
              />
              <Button variant="outline" className="pointer-events-none">
                <File className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>
            <div className="relative">
              <input
                type="file"
                {...({ webkitdirectory: "" } as any)}
                multiple
                onChange={handleFolderSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="pointer-events-none">
                <Folder className="h-4 w-4 mr-2" />
                Choose Folder
              </Button>
            </div>
          </div>
          {isProcessing && (
            <p className="text-sm text-muted-foreground">Processing files...</p>
          )}
        </div>
      </Card>

      {selectedFiles.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Selected Files ({selectedFiles.length})</h4>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded-md"
              >
                <div className="flex items-center space-x-2">
                  {file.originalFile?.name.endsWith('.zip') ? (
                    <Archive className="h-4 w-4 text-muted-foreground" />
                  ) : file.originalFile?.name.endsWith('.tar') ? (
                    <Archive className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <File className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm truncate">{file.name}</span>
                    {file.path !== file.name && (
                      <span className="text-xs text-muted-foreground truncate">{file.path}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({Math.round(file.content.length / 1024)}KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};