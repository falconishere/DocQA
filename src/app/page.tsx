
'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { File as FileIcon, Upload } from 'lucide-react';
import { askQuestion } from './actions';
import { documentContext } from '@/lib/document-context';
import type { GenerateAnswerOutput } from '@/ai/flows/generate-answer-from-context';

type Message = {
  role: 'user' | 'assistant';
  content: string | GenerateAnswerOutput;
};

export default function Page() {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const newHistory: Message[] = [
      ...history,
      { role: 'user', content: question },
    ];
    setHistory(newHistory);
    setQuestion('');
    
    const answer = await askQuestion({ question, context: documentContext });
    setHistory(prev => [...prev, {role: 'assistant', content: answer}]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 h-screen">
      {/* Left panel */}
      <div className="col-span-1 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>
              Upload PDF files to start asking questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) {
                  const newFiles = Array.from(e.dataTransfer.files);
                  setUploadedFiles((prevFiles) => [...prevFiles, ...newFiles]);
                }
              }}
            >
              <Upload className="w-12 h-12 text-gray-400" />
              <p className="mt-4 text-sm text-gray-600">
                Drag and drop your files here or
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </Button>
              <Input
                type="file"
                className="hidden"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
              />
            </div>
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">Uploaded Files:</h4>
                <ul className="list-disc list-inside bg-muted p-2 rounded-md">
                  {uploadedFiles.map((file, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <FileIcon className="w-4 h-4 mr-2" />
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="domain-mode">Domain Mode</Label>
              <Select defaultValue="general">
                <SelectTrigger id="domain-mode">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="answer-depth">Answer Depth</Label>
              <Select defaultValue="brief">
                <SelectTrigger id="answer-depth">
                  <SelectValue placeholder="Select depth" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">Brief</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right panel */}
      <div className="col-span-1 md:col-span-2 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Query</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div
                  key={index}
                  className={`flex ${
                    entry.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg max-w-[80%] ${
                      entry.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {typeof entry.content === 'string' ? (
                      entry.content
                    ) : (
                      <div>
                        <p>{entry.content.answer}</p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p>Source: {entry.content.source}</p>
                          <p>Confidence: {(entry.content.confidence * 100).toFixed(0)}%</p>
                          {entry.content.highlightedText && (
                            <div className="mt-1">
                                <p>Supporting Text:</p>
                                <blockquote className="border-l-2 border-border pl-2 italic">
                                    {entry.content.highlightedText}
                                </blockquote>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <form
              onSubmit={handleQuestionSubmit}
              className="flex w-full items-center space-x-2"
            >
              <Textarea
                placeholder="Type your question..."
                className="flex-1"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <Button type="submit">Ask</Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
