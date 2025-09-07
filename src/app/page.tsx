'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { File as FileIcon, Upload, Send, FileText, FileCode, Github, Sun, Moon, BotMessageSquare, Link as LinkIcon, Loader2 } from 'lucide-react';
import { askQuestion, fetchContentFromUrl } from './actions';
import type { GenerateAnswerOutput } from '@/ai/flows/generate-answer-from-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as pdfjsLib from 'pdfjs-dist';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Message = {
  role: 'user' | 'assistant';
  content: string | GenerateAnswerOutput;
};

type DocumentSource = {
  type: 'file';
  file: File;
} | {
  type: 'url';
  url: string;
  title: string;
}

// Helper function to escape special characters for RegExp
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};


export default function Page() {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [documentSource, setDocumentSource] = useState<DocumentSource | null>(null);
  const [documentContent, setDocumentContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [answerType, setAnswerType] = useState('Classic');
  const [domain, setDomain] = useState('General');
  const highlightRef = useRef<HTMLElement>(null);
  const [theme, setTheme] = useState('light');
  const [url, setUrl] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();
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
    setDocumentSource({type: 'file', file});
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

  const handleUrlFetch = async () => {
    if (!url.trim()) return;
    setIsFetchingUrl(true);
    setDocumentContent('');
    setDocumentSource(null);
    try {
      const result = await fetchContentFromUrl({ url });
      setDocumentContent(result.content);
      setDocumentSource({ type: 'url', url, title: result.title });
    } catch (error) {
      console.error("Failed to fetch from URL", error);
      setDocumentContent('Failed to load content from the URL. Please check the link and try again.');
      setDocumentSource({ type: 'url', url, title: 'Error' });
    } finally {
      setIsFetchingUrl(false);
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


  const getHighlightedContent = (content: string, highlightText: string | undefined) => {
    if (!highlightText || !content.includes(highlightText)) {
      return <p className="text-sm whitespace-pre-wrap">{content}</p>;
    }
  
    const parts = content.split(new RegExp(`(${escapeRegExp(highlightText)})`, 'i'));
  
    return (
      <p className="text-sm whitespace-pre-wrap">
        {parts.map((part, index) =>
          part.toLowerCase() === highlightText.toLowerCase() ? (
            <mark
              key={index}
              ref={highlightRef}
              className="bg-yellow-300 dark:bg-yellow-500 rounded-sm px-1 py-0.5"
            >
              {part}
            </mark>
          ) : (
            <React.Fragment key={index}>{part}</React.Fragment>
          )
        )}
      </p>
    );
  };
  
  const getDocumentName = () => {
    if (!documentSource) return 'Document content';
    if (documentSource.type === 'file') return documentSource.file.name;
    if (documentSource.type === 'url') return documentSource.title || documentSource.url;
    return 'Document content';
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-80 flex flex-col border-r border-border p-4">
        <div className="flex items-center gap-2 mb-6">
            <BotMessageSquare className="w-8 h-8 text-primary" />
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

        <div className="flex w-full items-center gap-2 mt-2">
            <Input 
                type="url" 
                placeholder="Or fetch from a URL..." 
                className="flex-1"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleUrlFetch();
                    }
                }}
            />
            <Button variant="outline" size="icon" onClick={handleUrlFetch} disabled={isFetchingUrl}>
                {isFetchingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
            </Button>
        </div>


        <p className="text-sm font-medium text-muted-foreground mt-6 mb-2">Documents</p>
        <ScrollArea className="flex-1">
          <ul className="space-y-1">
            {uploadedFiles.map((file, index) => (
              <li key={index}>
                <Button
                  variant={documentSource?.type === 'file' && documentSource.file.name === file.name ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-sm truncate"
                  onClick={() => processFile(file)}
                >
                  {getFileIcon(file.name)}
                  {file.name}
                </Button>
              </li>
            ))}
            {documentSource?.type === 'url' && (
              <li>
                <Button
                  variant='secondary'
                  className="w-full justify-start text-sm truncate"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  {documentSource.title}
                </Button>
              </li>
            )}
          </ul>
        </ScrollArea>
        
        <div className="mt-auto space-y-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-full justify-center">
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          <a href="https://github.com/firebase/studio-samples/tree/main/doc-qa" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground justify-center">
            <Github className="w-4 h-4" />
            View on GitHub
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 max-h-screen">
        {/* Document Viewer */}
        <div className="flex flex-col border-r border-border max-h-screen">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold truncate">{getDocumentName()}</h2>
          </div>
          <ScrollArea className="flex-1 p-4">
            {isFetchingUrl ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                getHighlightedContent(documentContent, lastAnswer?.highlight?.text)
            )}
          </ScrollArea>
        </div>

        {/* Q&A Chat */}
        <div className="flex flex-col max-h-screen">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold truncate">Q&A Chat</h2>
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
                        <div className="mt-4 text-xs bg-background/50 dark:bg-black/20 p-2 rounded-md">
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
          <div className="p-4 border-t border-border bg-background">
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
