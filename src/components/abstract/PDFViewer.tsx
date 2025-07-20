"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
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
} from "lucide-react";
import { motion } from "framer-motion";

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
  const [scale, setScale] = useState<number>(1.0);
  const [error, setError] = useState<string | null>(null);
  const [
    selectedCoordinate,
    setSelectedCoordinate,
  ] = useState<PDFCoordinate | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");

  // Create PDF URL when component mounts
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);

      // Cleanup URL when component unmounts
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  // Download handler
  const handleDownload = useCallback(() => {
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [file.name, pdfUrl]);

  // Open in new tab
  const handleOpenInNewTab = useCallback(() => {
    window.open(pdfUrl, "_blank");
  }, [pdfUrl]);

  // Scroll to coordinate
  const scrollToCoordinate = useCallback(
    (coordinate: PDFCoordinate) => {
      setSelectedCoordinate(coordinate);

      if (iframeRef.current && coordinate.page) {
        // Navigate to the specific page using URL fragment
        const pageUrl = `${pdfUrl}#page=${coordinate.page}`;
        if (iframeRef.current.src !== pageUrl) {
          iframeRef.current.src = pageUrl;
        }
      }
    },
    [pdfUrl]
  );

  // Zoom handlers
  const handleZoomIn = () => {
    if (iframeRef.current) {
      const newScale = Math.min(scale + 0.2, 2.0);
      setScale(newScale);
      iframeRef.current.style.transform = `scale(${newScale})`;
      iframeRef.current.style.transformOrigin = "top left";
    }
  };

  const handleZoomOut = () => {
    if (iframeRef.current) {
      const newScale = Math.max(scale - 0.2, 0.5);
      setScale(newScale);
      iframeRef.current.style.transform = `scale(${newScale})`;
      iframeRef.current.style.transformOrigin = "top left";
    }
  };

  const handleResetZoom = () => {
    if (iframeRef.current) {
      setScale(1.0);
      iframeRef.current.style.transform = "scale(1)";
    }
  };

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

  if (!pdfUrl) {
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
                  disabled={scale >= 2.0}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button onClick={handleResetZoom} variant="outline" size="sm">
                  Reset
                </Button>
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
          </CardContent>
        </Card>

        {/* PDF Viewer */}
        <Card>
          <CardContent className="p-0">
            <div className="w-full h-[700px] overflow-auto bg-gray-100">
              <iframe
                ref={iframeRef}
                src={pdfUrl}
                title={`PDF Preview: ${file.name}`}
                width="100%"
                height="700px"
                className="border-0"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  width: scale !== 1 ? `${100 / scale}%` : "100%",
                  height: scale !== 1 ? `${700 / scale}px` : "700px",
                }}
                onError={() => setError("Failed to load PDF")}
              />
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
