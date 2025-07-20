import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { AnalysisResult } from './CodeAnalyzer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalysisResultsProps {
  result: AnalysisResult;
  className?: string;
}

export const AnalysisResults = ({ result, className }: AnalysisResultsProps) => {
  const languageData = Object.entries(result.languages).map(([name, stats]) => ({
    name,
    code: stats.code,
    comment: stats.comment,
    blank: stats.blank,
    files: stats.files,
    percentage: ((stats.code / result.total.code) * 100).toFixed(1),
  })).sort((a, b) => b.code - a.code);

  const pieData = languageData.slice(0, 8).map((lang, index) => ({
    name: lang.name,
    value: lang.code,
    color: `hsl(${200 + index * 25}, 70%, ${50 + index * 5}%)`,
  }));

  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  return (
    <div className={className}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{result.total.files.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lines of Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{result.total.code.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comment Lines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{result.total.comment.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.total.total.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Code Distribution by Language</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={languageData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="code" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Language Statistics Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Languages Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Language</TableHead>
                <TableHead className="text-right">Files</TableHead>
                <TableHead className="text-right">Blank</TableHead>
                <TableHead className="text-right">Comment</TableHead>
                <TableHead className="text-right">Code</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Distribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {languageData.map((lang) => (
                <TableRow key={lang.name}>
                  <TableCell className="font-medium">
                    <Badge variant="secondary">{lang.name}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{lang.files}</TableCell>
                  <TableCell className="text-right">{lang.blank.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{lang.comment.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    {lang.code.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {(lang.blank + lang.comment + lang.code).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={parseFloat(lang.percentage)} className="w-20" />
                      <span className="text-sm text-muted-foreground">{lang.percentage}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-muted/50">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{result.total.files}</TableCell>
                <TableCell className="text-right">{result.total.blank.toLocaleString()}</TableCell>
                <TableCell className="text-right">{result.total.comment.toLocaleString()}</TableCell>
                <TableCell className="text-right text-primary">{result.total.code.toLocaleString()}</TableCell>
                <TableCell className="text-right">{result.total.total.toLocaleString()}</TableCell>
                <TableCell>100%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* File Details */}
      <Card>
        <CardHeader>
          <CardTitle>File Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Language</TableHead>
                <TableHead className="text-right">Blank</TableHead>
                <TableHead className="text-right">Comment</TableHead>
                <TableHead className="text-right">Code</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.files
                .sort((a, b) => b.code - a.code)
                .map((file, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium max-w-xs truncate" title={file.name}>
                      {file.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{file.language}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{file.blank}</TableCell>
                    <TableCell className="text-right">{file.comment}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">{file.code}</TableCell>
                    <TableCell className="text-right">{file.lines}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};