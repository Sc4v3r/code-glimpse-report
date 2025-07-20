import { useMemo } from 'react';

export interface LanguageStats {
  files: number;
  blank: number;
  comment: number;
  code: number;
  total: number;
}

export interface AnalysisResult {
  languages: Record<string, LanguageStats>;
  total: LanguageStats;
  files: Array<{
    name: string;
    language: string;
    lines: number;
    blank: number;
    comment: number;
    code: number;
  }>;
}

// Language detection based on file extensions
const getLanguageFromExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  const languageMap: Record<string, string> = {
    'js': 'JavaScript',
    'jsx': 'JavaScript React',
    'ts': 'TypeScript',
    'tsx': 'TypeScript React',
    'py': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'cc': 'C++',
    'cxx': 'C++',
    'c': 'C',
    'h': 'C Header',
    'hpp': 'C++ Header',
    'cs': 'C#',
    'php': 'PHP',
    'rb': 'Ruby',
    'go': 'Go',
    'rs': 'Rust',
    'swift': 'Swift',
    'kt': 'Kotlin',
    'dart': 'Dart',
    'vue': 'Vue',
    'html': 'HTML',
    'htm': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'sass': 'Sass',
    'less': 'Less',
    'xml': 'XML',
    'json': 'JSON',
    'md': 'Markdown',
    'txt': 'Text',
    'sql': 'SQL',
    'sh': 'Shell',
    'bat': 'Batch',
    'ps1': 'PowerShell',
    'yaml': 'YAML',
    'yml': 'YAML',
  };
  
  return languageMap[ext] || 'Unknown';
};

// Comment patterns for different languages
const getCommentPatterns = (language: string) => {
  const patterns: Record<string, { single?: string; blockStart?: string; blockEnd?: string }> = {
    'JavaScript': { single: '//', blockStart: '/*', blockEnd: '*/' },
    'JavaScript React': { single: '//', blockStart: '/*', blockEnd: '*/' },
    'TypeScript': { single: '//', blockStart: '/*', blockEnd: '*/' },
    'TypeScript React': { single: '//', blockStart: '/*', blockEnd: '*/' },
    'Java': { single: '//', blockStart: '/*', blockEnd: '*/' },
    'C++': { single: '//', blockStart: '/*', blockEnd: '*/' },
    'C': { single: '//', blockStart: '/*', blockEnd: '*/' },
    'C Header': { single: '//', blockStart: '/*', blockEnd: '*/' },
    'C++ Header': { single: '//', blockStart: '/*', blockEnd: '*/' },
    'C#': { single: '//', blockStart: '/*', blockEnd: '*/' },
    'PHP': { single: '//', blockStart: '/*', blockEnd: '*/' },
    'CSS': { blockStart: '/*', blockEnd: '*/' },
    'SCSS': { single: '//', blockStart: '/*', blockEnd: '*/' },
    'Sass': { single: '//' },
    'Less': { single: '//', blockStart: '/*', blockEnd: '*/' },
    'Python': { single: '#', blockStart: '"""', blockEnd: '"""' },
    'Ruby': { single: '#', blockStart: '=begin', blockEnd: '=end' },
    'Go': { single: '//', blockStart: '/*', blockEnd: '*/' },
    'Rust': { single: '//', blockStart: '/*', blockEnd: '*/' },
    'Swift': { single: '//', blockStart: '/*', blockEnd: '*/' },
    'Kotlin': { single: '//', blockStart: '/*', blockEnd: '*/' },
    'Dart': { single: '//', blockStart: '/*', blockEnd: '*/' },
    'Shell': { single: '#' },
    'Batch': { single: 'REM' },
    'PowerShell': { single: '#', blockStart: '<#', blockEnd: '#>' },
    'HTML': { blockStart: '<!--', blockEnd: '-->' },
    'XML': { blockStart: '<!--', blockEnd: '-->' },
    'Vue': { blockStart: '<!--', blockEnd: '-->' },
    'SQL': { single: '--', blockStart: '/*', blockEnd: '*/' },
    'YAML': { single: '#' },
  };
  
  return patterns[language] || { single: '//' };
};

const analyzeFileContent = (content: string, filename: string, language: string) => {
  const lines = content.split('\n');
  const patterns = getCommentPatterns(language);
  
  let blankLines = 0;
  let commentLines = 0;
  let codeLines = 0;
  let inBlockComment = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check for blank lines
    if (trimmed === '') {
      blankLines++;
      continue;
    }
    
    let isComment = false;
    
    // Check for block comments
    if (patterns.blockStart && patterns.blockEnd) {
      if (inBlockComment) {
        isComment = true;
        if (trimmed.includes(patterns.blockEnd)) {
          inBlockComment = false;
        }
      } else if (trimmed.includes(patterns.blockStart)) {
        isComment = true;
        inBlockComment = true;
        if (trimmed.includes(patterns.blockEnd)) {
          inBlockComment = false;
        }
      }
    }
    
    // Check for single line comments
    if (!isComment && patterns.single) {
      if (trimmed.startsWith(patterns.single) || 
          (patterns.single === 'REM' && trimmed.toLowerCase().startsWith('rem '))) {
        isComment = true;
      }
    }
    
    if (isComment) {
      commentLines++;
    } else {
      codeLines++;
    }
  }
  
  return {
    name: filename,
    language,
    lines: lines.length,
    blank: blankLines,
    comment: commentLines,
    code: codeLines,
  };
};

export const useCodeAnalyzer = (files: File[]) => {
  return useMemo(async (): Promise<AnalysisResult> => {
    const fileAnalyses: Array<{
      name: string;
      language: string;
      lines: number;
      blank: number;
      comment: number;
      code: number;
    }> = [];
    
    const languageStats: Record<string, LanguageStats> = {};
    
    for (const file of files) {
      try {
        const content = await file.text();
        const language = getLanguageFromExtension(file.name);
        const analysis = analyzeFileContent(content, file.name, language);
        
        fileAnalyses.push(analysis);
        
        if (!languageStats[language]) {
          languageStats[language] = {
            files: 0,
            blank: 0,
            comment: 0,
            code: 0,
            total: 0,
          };
        }
        
        languageStats[language].files++;
        languageStats[language].blank += analysis.blank;
        languageStats[language].comment += analysis.comment;
        languageStats[language].code += analysis.code;
        languageStats[language].total += analysis.lines;
      } catch (error) {
        console.error(`Error analyzing file ${file.name}:`, error);
      }
    }
    
    // Calculate totals
    const total: LanguageStats = Object.values(languageStats).reduce(
      (acc, stats) => ({
        files: acc.files + stats.files,
        blank: acc.blank + stats.blank,
        comment: acc.comment + stats.comment,
        code: acc.code + stats.code,
        total: acc.total + stats.total,
      }),
      { files: 0, blank: 0, comment: 0, code: 0, total: 0 }
    );
    
    return {
      languages: languageStats,
      total,
      files: fileAnalyses,
    };
  }, [files]);
};