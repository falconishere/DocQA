
'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { File as FileIcon, Upload, Send, FileText, FileCode, Github } from 'lucide-react';
import { askQuestion } from './actions';
import type { GenerateAnswerOutput } from '@/ai/flows/generate-answer-from-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as pdfjsLib from 'pdfjs-dist';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Message = {
  role: 'user' | 'assistant';
  content: string | GenerateAnswerOutput;
};

const BrainCircuit = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 5a3 3 0 1 0-5.993.129" />
      <path d="M12 5a3 3 0 1 0 5.993.129" />
      <path d="M15 13a3 3 0 1 0-5.993.129" />
      <path d="M15 13a3 3 0 1 0 5.993.129" />
      <path d="M9 13a3 3 0 1 0-5.993.129" />
      <path d="M6.007 5.129A3 3 0 1 0 9 13" />
      <path d="M18.007 5.129A3 3 0 1 0 15 13" />
      <path d="M9 13a3 3 0 1 0 6 0" />
      <path d="M14.12 3.88A3 3 0 1 0 9.88 2.12" />
      <path d="M14.12 20.12a3 3 0 1 0-4.24 0" />
      <path d="M19.88 9.88a3 3 0 1 0 0 4.24" />
      <path d="M4.12 9.88a3 3 0 1 0 0 4.24" />
    </svg>
  );

export default function Page() {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentContent, setDocumentContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [answerType, setAnswerType] = useState('Classic');
  const [domain, setDomain] = useState('General');
  const highlightRef = useRef<HTMLElement>(null);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }, []);

  const extractTextFromPdf = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      text += textContent.items.map((item: any) => item.str).join(' ');
      if (i < pdf.numPages) {
        text += '\n\n';
      }
    }
    return text;
  };

  const processFile = async (file: File) => {
    let text = '';
    if (file.type === 'application/pdf') {
      text = await extractTextFromPdf(file);
    } else {
      text = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.readAsText(file);
      });
    }
    setDocumentContent(text);
    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const updatedFiles = [...uploadedFiles];
      let fileToProcess: File | null = null;
  
      newFiles.forEach(file => {
        if (!updatedFiles.some(f => f.name === file.name)) {
          updatedFiles.push(file);
        }
      });
      
      setUploadedFiles(updatedFiles);

      if (newFiles.length > 0) {
        fileToProcess = newFiles[0];
      }
      
      if (fileToProcess) {
        processFile(fileToProcess);
      }
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
    
    const answer = await askQuestion({ question, context: documentContent, answerType, domain });
    setHistory(prev => [...prev, {role: 'assistant', content: answer}]);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.pdf')) return <FileText className="w-4 h-4 mr-2 text-red-500" />;
    if (fileName.endsWith('.md')) return <FileCode className="w-4 h-4 mr-2 text-blue-500" />;
    if (fileName.endsWith('.html')) return <FileCode className="w-4 h-4 mr-2 text-green-500" />;
    return <FileIcon className="w-4 h-4 mr-2" />;
  }

  const lastAnswer = history.findLast(m => m.role === 'assistant')?.content as GenerateAnswerOutput | undefined;

  useEffect(() => {
    if (highlightRef.current) {
        highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [lastAnswer]);


  const getHighlightedContent = (content: string, highlight: GenerateAnswerOutput['highlight'] | undefined) => {
    if (!highlight || highlight.startIndex === -1 || highlight.endIndex === -1 || !content) {
      return <p className="text-sm whitespace-pre-wrap">{content}</p>;
    }

    const { startIndex, endIndex } = highlight;
    const before = content.substring(0, startIndex);
    const marked = content.substring(startIndex, endIndex);
    const after = content.substring(endIndex);

    return (
      <p className="text-sm whitespace-pre-wrap">
        {before}
        <mark ref={highlightRef} className="bg-yellow-300 rounded-sm">
          {marked}
        </mark>
        {after}
      </p>
    );
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-border p-4">
        <div className="flex items-center gap-2 mb-6">
            <BrainCircuit className="w-8 h-8 text-primary" />
            <div>
                <h1 className="text-lg font-semibold">ContextQA</h1>
                <p className="text-xs text-muted-foreground">Ask questions to your documents</p>
            </div>
        </div>
        
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </Button>
        <Input
          type="file"
          className="hidden"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.txt,.md,.html"
        />

        <p className="text-sm font-medium text-muted-foreground mt-6 mb-2">Documents</p>
        <ScrollArea className="flex-1">
          <ul className="space-y-1">
            {uploadedFiles.map((file, index) => (
              <li key={index}>
                <Button
                  variant={selectedFile?.name === file.name ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-sm truncate"
                  onClick={() => processFile(file)}
                >
                  {getFileIcon(file.name)}
                  {file.name}
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
        
        <div className="mt-auto">
          <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <Github className="w-4 h-4" />
            View on GitHub
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 h-screen">
        {/* Document Viewer */}
        <div className="flex flex-col border-r border-border">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold">{selectedFile?.name || 'Document content'}</h2>
            <p className="text-sm text-muted-foreground">Document content</p>
          </div>
          <ScrollArea className="flex-1 p-4">
            {getHighlightedContent(documentContent, lastAnswer?.highlight)}
          </ScrollArea>
        </div>

        {/* Q&A Chat */}
        <div className="flex flex-col h-screen">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold">{selectedFile?.name || 'Ask a question'}</h2>
            <p className="text-sm text-muted-foreground">Ask a question about the document.</p>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
            {history.map((entry, index) => (
              <div
                key={index}
                className={`flex ${
                  entry.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <Card
                  className={`max-w-[80%] p-3 ${
                    entry.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                    {typeof entry.content === 'string' ? (
                      entry.content
                    ) : (
                      <CardContent className="p-0">
                        <p>{entry.content.answer}</p>
                        {entry.content.source && (
                        <div className="mt-4 text-xs bg-background/50 p-2 rounded-md">
                          <p className="font-semibold mb-1">Source: {entry.content.source}</p>
                          <p className="mb-1">Confidence: {(entry.content.confidence * 100).toFixed(0)}%</p>
                          {entry.content.highlight?.text && (
                            <div>
                                <p className="font-semibold">Supporting Text:</p>
                                <blockquote className="border-l-2 border-border pl-2 italic mt-1">
                                    {entry.content.highlight.text}
                                </blockquote>
                            </div>
                          )}
                        </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
              </div>
            ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="answer-type" className="text-sm font-medium">Answering Type</Label>
                <Select value={answerType} onValueChange={setAnswerType}>
                  <SelectTrigger id="answer-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brief">Brief</SelectItem>
                    <SelectItem value="Classic">Classic</SelectItem>
                    <SelectItem value="Educational">Educational</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="domain" className="text-sm font-medium">Domain</Label>
                <Select value={domain} onValueChange={setDomain}>
                  <SelectTrigger id="domain">
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Job">Job</SelectItem>
                    <SelectItem value="Law">Law</SelectItem>
                    <SelectItem value="Research">Research</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <form onSubmit={handleQuestionSubmit} className="relative">
              <Textarea
                placeholder="Ask a follow-up question..."
                className="pr-12 resize-none"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleQuestionSubmit(e);
                    }
                }}
              />
              <Button type="submit" size="icon" className="absolute bottom-2.5 right-2.5 w-8 h-8">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

    