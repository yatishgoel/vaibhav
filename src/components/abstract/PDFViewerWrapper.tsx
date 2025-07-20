"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

// Dynamically import PDFViewer with no SSR
const PDFViewer = dynamic(() => import("./PDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Preparing PDF Viewer...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-500">Loading PDF viewer...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
});

interface PDFViewerWrapperProps {
  file: File;
  onAnalyze?: () => void;
}

export default function PDFViewerWrapper({
  file,
  onAnalyze,
}: PDFViewerWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Initializing PDF Viewer...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-pulse rounded-lg h-8 w-48 bg-gray-200 mx-auto mb-4"></div>
                <div className="text-gray-500">Setting up PDF viewer...</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <PDFViewer file={file} onAnalyze={onAnalyze} />;
}
