"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ZoomIn,
  ZoomOut,
  Download,
  FileText,
  MapPin,
  ExternalLink,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

// Configure PDF.js worker with stable CDN
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

interface PDFCoordinate {
  id: string;
  label: string;
  page: number;
  x: number;
  y: number;
  description: string;
  category: "rent" | "lease-term" | "tenant" | "landlord" | "clauses" | "dates";
}

interface PDFViewerProps {
  file: File;
  onAnalyze?: () => void;
}

// Sample coordinates for demonstration
const sampleCoordinates: PDFCoordinate[] = [
  {
    id: "1",
    label: "Monthly Rent",
    page: 1,
    x: 200,
    y: 300,
    description: "Base monthly rental amount",
    category: "rent",
  },
  {
    id: "2",
    label: "Lease Start Date",
    page: 1,
    x: 150,
    y: 400,
    description: "Commencement date of lease",
    category: "dates",
  },
  {
    id: "3",
    label: "Tenant Name",
    page: 1,
    x: 100,
    y: 150,
    description: "Primary tenant information",
    category: "tenant",
  },
  {
    id: "4",
    label: "Lease Term",
    page: 1,
    x: 300,
    y: 250,
    description: "Duration of lease agreement",
    category: "lease-term",
  },
  {
    id: "5",
    label: "Security Deposit",
    page: 2,
    x: 180,
    y: 200,
    description: "Required security deposit amount",
    category: "rent",
  },
];

export default function PDFViewer({ file, onAnalyze }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [
    selectedCoordinate,
    setSelectedCoordinate,
  ] = useState<PDFCoordinate | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Handle PDF document load success
  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setLoading(false);
      setError(null);
    },
    []
  );

  // Handle PDF document load error
  const onDocumentLoadError = useCallback((error: Error) => {
    console.error("PDF load error:", error);
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  }, []);

  // Scroll to specific coordinates
  const scrollToCoordinate = useCallback(
    (coordinate: PDFCoordinate) => {
      setSelectedCoordinate(coordinate);

      // Navigate to the target page first if different
      if (coordinate.page !== pageNumber) {
        setPageNumber(coordinate.page);
        // Wait for page to render before scrolling
        setTimeout(() => scrollToPosition(coordinate), 800);
      } else {
        scrollToPosition(coordinate);
      }
    },
    [pageNumber]
  );

  const scrollToPosition = useCallback(
    (coordinate: PDFCoordinate) => {
      if (containerRef.current) {
        // Calculate scaled coordinates (PDF coordinates are typically in points, convert to pixels)
        const scaledX = coordinate.x * scale;
        const scaledY = coordinate.y * scale;

        // Get container dimensions
        const containerRect = containerRef.current.getBoundingClientRect();

        // Calculate scroll position (center the coordinate in view)
        const scrollLeft = Math.max(0, scaledX - containerRect.width / 2);
        const scrollTop = Math.max(0, scaledY - containerRect.height / 2);

        // Smooth scroll to position
        containerRef.current.scrollTo({
          left: scrollLeft,
          top: scrollTop,
          behavior: "smooth",
        });
      }
    },
    [scale]
  );

  // Download handler
  const handleDownload = useCallback(() => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [file]);

  // Open in new tab
  const handleOpenInNewTab = useCallback(() => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank");
  }, [file]);

  // Zoom handlers
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setScale(1.0);

  // Page navigation
  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setPageNumber((prev) => Math.min(prev + 1, numPages));

  const getCategoryColor = (category: PDFCoordinate["category"]) => {
    switch (category) {
      case "rent":
        return "bg-green-100 text-green-800";
      case "lease-term":
        return "bg-blue-100 text-blue-800";
      case "tenant":
        return "bg-purple-100 text-purple-800";
      case "landlord":
        return "bg-orange-100 text-orange-800";
      case "clauses":
        return "bg-yellow-100 text-yellow-800";
      case "dates":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading PDF...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <FileText className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading PDF
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleDownload} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Coordinate Navigation Panel */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Key Sections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sampleCoordinates.map((coord) => (
              <motion.div
                key={coord.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={
                    selectedCoordinate?.id === coord.id ? "default" : "outline"
                  }
                  size="sm"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => scrollToCoordinate(coord)}
                >
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-medium text-sm">{coord.label}</span>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getCategoryColor(
                          coord.category
                        )}`}
                      >
                        Page {coord.page}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-600">
                      {coord.description}
                    </span>
                  </div>
                </Button>
              </motion.div>
            ))}

            {onAnalyze && (
              <div className="pt-4 border-t">
                <Button onClick={onAnalyze} className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  Start Analysis
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* PDF Viewer Panel */}
      <div className="lg:col-span-3">
        {/* PDF Controls */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={goToPrevPage}
                  disabled={pageNumber <= 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-[80px] text-center">
                  Page {pageNumber} of {numPages}
                </span>
                <Button
                  onClick={goToNextPage}
                  disabled={pageNumber >= numPages}
                  variant="outline"
                  size="sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <div className="border-l pl-2 ml-2 flex items-center gap-2">
                  <Button
                    onClick={handleZoomOut}
                    variant="outline"
                    size="sm"
                    disabled={scale <= 0.5}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600 min-w-[60px] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button
                    onClick={handleZoomIn}
                    variant="outline"
                    size="sm"
                    disabled={scale >= 2.5}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleResetZoom} variant="outline" size="sm">
                    Reset
                  </Button>
                </div>

                <div className="border-l pl-2 ml-2 flex items-center gap-2">
                  <Button
                    onClick={handleOpenInNewTab}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleDownload} variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PDF Viewer */}
        <Card>
          <CardContent className="p-0">
            <div
              ref={containerRef}
              className="w-full h-[700px] overflow-auto bg-gray-100"
            >
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-600">Loading PDF...</div>
                  </div>
                }
                className="flex justify-center"
              >
                <div className="relative">
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    loading={
                      <div className="flex items-center justify-center h-96">
                        <div className="text-gray-500">Loading page...</div>
                      </div>
                    }
                    className="shadow-lg mb-4"
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />

                  {/* Coordinate Markers for current page */}
                  {sampleCoordinates
                    .filter((coord) => coord.page === pageNumber)
                    .map((coord) => (
                      <motion.div
                        key={coord.id}
                        className={`absolute w-6 h-6 rounded-full border-2 cursor-pointer z-10 flex items-center justify-center ${
                          selectedCoordinate?.id === coord.id
                            ? "bg-red-500 border-red-600 animate-pulse"
                            : "bg-blue-500 border-blue-600 hover:bg-blue-600"
                        }`}
                        style={{
                          left: coord.x * scale - 12,
                          top: coord.y * scale - 12,
                        }}
                        onClick={() => scrollToCoordinate(coord)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        title={`${coord.label}: ${coord.description}`}
                        animate={
                          selectedCoordinate?.id === coord.id
                            ? {
                                scale: [1, 1.3, 1],
                                backgroundColor: [
                                  "#ef4444",
                                  "#dc2626",
                                  "#ef4444",
                                ],
                              }
                            : {}
                        }
                        transition={{
                          duration: 0.6,
                          repeat: selectedCoordinate?.id === coord.id ? 2 : 0,
                        }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </motion.div>
                    ))}
                </div>
              </Document>
            </div>
          </CardContent>
        </Card>

        {/* Selected Coordinate Info */}
        {selectedCoordinate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">
                        {selectedCoordinate.label}
                      </h4>
                      <Badge
                        className={getCategoryColor(
                          selectedCoordinate.category
                        )}
                      >
                        {selectedCoordinate.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedCoordinate.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Page {selectedCoordinate.page} • Position: (
                      {selectedCoordinate.x}, {selectedCoordinate.y})
                    </p>
                  </div>
                  <Badge variant="outline">
                    Page {selectedCoordinate.page}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
