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
  RotateCw,
  Download,
  FileText,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";

// Set PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

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
    label: "Lease Term",
    page: 1,
    x: 150,
    y: 450,
    description: "Duration of the lease agreement",
    category: "lease-term",
  },
  {
    id: "3",
    label: "Tenant Information",
    page: 1,
    x: 100,
    y: 200,
    description: "Primary tenant details and contact",
    category: "tenant",
  },
  {
    id: "4",
    label: "Security Deposit",
    page: 2,
    x: 250,
    y: 350,
    description: "Required security deposit amount",
    category: "rent",
  },
  {
    id: "5",
    label: "Renewal Clause",
    page: 2,
    x: 180,
    y: 500,
    description: "Terms for lease renewal",
    category: "clauses",
  },
  {
    id: "6",
    label: "Move-in Date",
    page: 1,
    x: 300,
    y: 380,
    description: "Official lease commencement date",
    category: "dates",
  },
];

const categoryColors = {
  rent: "bg-green-100 text-green-800 border-green-300",
  "lease-term": "bg-blue-100 text-blue-800 border-blue-300",
  tenant: "bg-purple-100 text-purple-800 border-purple-300",
  landlord: "bg-orange-100 text-orange-800 border-orange-300",
  clauses: "bg-red-100 text-red-800 border-red-300",
  dates: "bg-yellow-100 text-yellow-800 border-yellow-300",
};

export default function PDFViewer({ file, onAnalyze }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [selectedCoordinate, setSelectedCoordinate] = useState<string | null>(
    null
  );
  const [highlightedCoords, setHighlightedCoords] = useState<PDFCoordinate[]>(
    []
  );

  const pageRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    // Filter coordinates for current page
    const pageCoords = sampleCoordinates.filter(
      (coord) => coord.page === pageNumber
    );
    setHighlightedCoords(pageCoords);
  }, [pageNumber]);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
    },
    []
  );

  const scrollToCoordinate = useCallback(
    (coordinate: PDFCoordinate) => {
      if (coordinate.page !== pageNumber) {
        setPageNumber(coordinate.page);
        // Wait for page to render before scrolling
        setTimeout(() => scrollToPoint(coordinate), 300);
      } else {
        scrollToPoint(coordinate);
      }
      setSelectedCoordinate(coordinate.id);
    },
    [pageNumber]
  );

  const scrollToPoint = useCallback(
    (coordinate: PDFCoordinate) => {
      if (pageRef.current && documentRef.current) {
        const pageElement = pageRef.current;
        const containerElement = documentRef.current;

        // Calculate scaled coordinates
        const scaledX = coordinate.x * scale;
        const scaledY = coordinate.y * scale;

        // Scroll to the coordinate with some offset for better visibility
        const scrollLeft = Math.max(
          0,
          scaledX - containerElement.clientWidth / 2
        );
        const scrollTop = Math.max(
          0,
          scaledY - containerElement.clientHeight / 2
        );

        containerElement.scrollTo({
          left: scrollLeft,
          top: scrollTop,
          behavior: "smooth",
        });

        // Add a temporary highlight effect
        setTimeout(() => setSelectedCoordinate(null), 2000);
      }
    },
    [scale]
  );

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3.0));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handlePreviousPage = () =>
    setPageNumber((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setPageNumber((prev) => Math.min(prev + 1, numPages));

  const handleDownload = () => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Coordinate Navigation Panel */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Key Document Sections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sampleCoordinates.map((coord) => (
              <motion.div
                key={coord.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={
                    selectedCoordinate === coord.id ? "default" : "outline"
                  }
                  className={`w-full h-auto p-3 flex flex-col items-start gap-1 ${
                    selectedCoordinate === coord.id
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  onClick={() => scrollToCoordinate(coord)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-sm">{coord.label}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${categoryColors[coord.category]}`}
                    >
                      Page {coord.page}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500 text-left">
                    {coord.description}
                  </span>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PDF Viewer Controls */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              {file.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-3">
                Page {pageNumber} of {numPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={pageNumber >= numPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-2">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={scale >= 3.0}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleRotate}>
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* PDF Document */}
          <div
            ref={documentRef}
            className="border border-gray-300 rounded-lg overflow-auto bg-gray-100"
            style={{ height: "600px" }}
          >
            <div className="relative">
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center h-96">
                    <div className="text-gray-500">Loading PDF...</div>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center h-96">
                    <div className="text-red-500">Error loading PDF</div>
                  </div>
                }
              >
                <div ref={pageRef} className="relative">
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    rotate={rotation}
                    loading={
                      <div className="flex items-center justify-center h-96">
                        <div className="text-gray-500">Loading page...</div>
                      </div>
                    }
                  />

                  {/* Coordinate Markers */}
                  {highlightedCoords.map((coord) => (
                    <motion.div
                      key={coord.id}
                      className={`absolute w-4 h-4 rounded-full border-2 cursor-pointer z-10 ${
                        selectedCoordinate === coord.id
                          ? "bg-red-500 border-red-600 animate-pulse"
                          : "bg-blue-500 border-blue-600 hover:bg-blue-600"
                      }`}
                      style={{
                        left: coord.x * scale - 8,
                        top: coord.y * scale - 8,
                      }}
                      onClick={() => scrollToCoordinate(coord)}
                      whileHover={{ scale: 1.5 }}
                      title={`${coord.label}: ${coord.description}`}
                      animate={
                        selectedCoordinate === coord.id
                          ? { scale: [1, 1.5, 1] }
                          : {}
                      }
                      transition={{
                        duration: 0.5,
                        repeat: selectedCoordinate === coord.id ? 2 : 0,
                      }}
                    />
                  ))}
                </div>
              </Document>
            </div>
          </div>

          {/* Analysis Button */}
          {onAnalyze && (
            <div className="mt-6 text-center">
              <Button
                onClick={onAnalyze}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                <Eye className="w-4 h-4 mr-2" />
                Start Abstract Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
