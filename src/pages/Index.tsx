import { useState, useEffect } from 'react';
import { Code, BarChart3, FileText, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload, ProcessedFile } from '@/components/FileUpload';
import { AnalysisResults } from '@/components/AnalysisResults';
import { useCodeAnalyzer, AnalysisResult } from '@/components/CodeAnalyzer';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();
  const analyzer = useCodeAnalyzer(files);

  const handleFilesSelected = (selectedFiles: ProcessedFile[]) => {
    setFiles(selectedFiles);
    setAnalysisResult(null);
  };

  const analyzeCode = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload some code files to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzer;
      setAnalysisResult(result);
      toast({
        title: "Analysis complete!",
        description: `Analyzed ${result.total.files} files with ${result.total.code.toLocaleString()} lines of code.`,
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your code files.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
              <Code className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Code Line Counter
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Analyze your source code like the popular CLOC tool. Upload files and get detailed statistics about lines of code, comments, and blank lines across different programming languages.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center">
              <BarChart3 className="h-8 w-8 text-white mx-auto mb-2" />
              <CardTitle className="text-white">Detailed Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 text-center">
                Get comprehensive statistics with interactive charts and breakdowns by language
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center">
              <FileText className="h-8 w-8 text-white mx-auto mb-2" />
              <CardTitle className="text-white">Multi-Language Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 text-center">
                Supports 25+ programming languages with intelligent comment detection
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center">
              <Zap className="h-8 w-8 text-white mx-auto mb-2" />
              <CardTitle className="text-white">Instant Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 text-center">
                Fast client-side analysis with no file uploads to external servers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-glow">
            <CardHeader>
              <CardTitle className="text-2xl">Upload Your Code</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload onFilesSelected={handleFilesSelected} className="mb-6" />
              
              {files.length > 0 && (
                <div className="text-center">
                  <Button 
                    onClick={analyzeCode} 
                    disabled={isAnalyzing}
                    size="lg"
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Code"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {analysisResult && (
            <div className="mt-8">
              <AnalysisResults result={analysisResult} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
