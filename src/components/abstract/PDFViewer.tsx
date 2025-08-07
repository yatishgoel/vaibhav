"use client";

import React from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import {
  highlightPlugin,
  RenderHighlightsProps,
} from "@react-pdf-viewer/highlight";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, MapPin, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { ExtractedResult } from "@/entities/LeaseAnalysis";

interface PDFCoordinate {
  id: string;
  label: string;
  page: number;
  x: number; // Percentage from left (0-100)
  y: number; // Percentage from top (0-100)
  width: number; // Percentage width (0-100)
  height: number; // Percentage height (0-100)
  description: string;
  category: "rent" | "lease-term" | "tenant" | "landlord" | "clauses" | "dates";
  answer?: string;
  similarity?: number;
}

interface PDFViewerProps {
  file: File;
  scrollToCoordinates?: PDFCoordinate | null;
  extractedResults?: ExtractedResult[];
}

// Convert API coordinates to percentage-based coordinates
const convertCoordinatesToPercentage = (
  result: ExtractedResult,
  pageWidth: number = 595, // Standard PDF page width in points
  pageHeight: number = 842 // Standard PDF page height in points
): PDFCoordinate => {
  const { coordinates } = result.pdf_highlight;

  return {
    id: `extracted-${Math.random().toString(36).substr(2, 9)}`,
    label: result.question,
    page: result.pdf_highlight.page,
    x: (coordinates.x0 / pageWidth) * 100,
    y: (coordinates.y0 / pageHeight) * 100,
    width: (coordinates.width / pageWidth) * 100,
    height: (coordinates.height / pageHeight) * 100,
    description: result.answer,
    category: getCategoryFromQuestion(result.question),
    answer: result.answer,
    similarity: result.pdf_highlight.similarity,
  };
};

// Determine category based on question content
const getCategoryFromQuestion = (
  question: string
): PDFCoordinate["category"] => {
  const lowerQuestion = question.toLowerCase();

  if (
    lowerQuestion.includes("rent") ||
    lowerQuestion.includes("deposit") ||
    lowerQuestion.includes("payment")
  ) {
    return "rent";
  }
  if (
    lowerQuestion.includes("term") ||
    lowerQuestion.includes("duration") ||
    lowerQuestion.includes("lease term")
  ) {
    return "lease-term";
  }
  if (lowerQuestion.includes("tenant") || lowerQuestion.includes("lessee")) {
    return "tenant";
  }
  if (lowerQuestion.includes("landlord") || lowerQuestion.includes("lessor")) {
    return "landlord";
  }
  if (
    lowerQuestion.includes("date") ||
    lowerQuestion.includes("commencement") ||
    lowerQuestion.includes("expiration")
  ) {
    return "dates";
  }
  return "clauses";
};

// Sample coordinates for demonstration (using percentages with width and height)
const sampleCoordinates: PDFCoordinate[] = [
  {
    id: "1",
    label: "Monthly Rent",
    page: 1,
    x: 20, // 20% from left
    y: 30, // 30% from top
    width: 25, // 25% width
    height: 8, // 8% height
    description: "Base monthly rental amount",
    category: "rent",
  },
  {
    id: "2",
    label: "Lease Start Date",
    page: 1,
    x: 15,
    y: 40,
    width: 30,
    height: 6,
    description: "Commencement date of lease",
    category: "dates",
  },
  {
    id: "3",
    label: "Tenant Name",
    page: 1,
    x: 10,
    y: 15,
    width: 35,
    height: 10,
    description: "Primary tenant information",
    category: "tenant",
  },
  {
    id: "4",
    label: "Lease Term",
    page: 1,
    x: 30,
    y: 25,
    width: 20,
    height: 5,
    description: "Duration of lease agreement",
    category: "lease-term",
  },
  {
    id: "5",
    label: "Security Deposit",
    page: 2,
    x: 18,
    y: 20,
    width: 28,
    height: 7,
    description: "Required security deposit amount",
    category: "rent",
  },
];

export default function PDFViewer({
  file,
  scrollToCoordinates,
  extractedResults = [],
}: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = React.useState<string>("");
  const [
    selectedCoordinate,
    setSelectedCoordinate,
  ] = React.useState<PDFCoordinate | null>(null);
  const [documentLoaded, setDocumentLoaded] = React.useState(false);

  // Convert extracted results to coordinates or use sample data
  const coordinates = React.useMemo(() => {
    if (extractedResults.length > 0) {
      return extractedResults.map((result) =>
        convertCoordinatesToPercentage(result)
      );
    }
    return sampleCoordinates;
  }, [extractedResults]);

  // Initialize plugins
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  // Get category-based colors for highlights
  const getCategoryHighlightColor = () => {
    return { backgroundColor: "#eab308", opacity: 0.3 }; // Always yellow
  };

  // Configure highlight plugin with custom rendering (only show selected highlight)
  const highlightPluginInstance = highlightPlugin({
    renderHighlights: (props: RenderHighlightsProps) => (
      <div>
        {selectedCoordinate && selectedCoordinate.page - 1 === props.pageIndex && (
          <div
            className="cursor-pointer transition-all duration-200 ring-2 ring-blue-500 ring-offset-1"
            style={{
              ...props.getCssProperties(
                {
                  pageIndex: selectedCoordinate.page - 1,
                  left: selectedCoordinate.x,
                  top: selectedCoordinate.y,
                  width: selectedCoordinate.width,
                  height: selectedCoordinate.height,
                },
                props.rotation
              ),
              ...getCategoryHighlightColor(),
              opacity: 0.5,
              border: "2px solid #3b82f6",
              borderRadius: "2px",
            }}
            onClick={() => scrollToPosition(selectedCoordinate)}
            title={`${selectedCoordinate.label}: ${selectedCoordinate.description}`}
          />
        )}
      </div>
    ),
  });

  const { jumpToHighlightArea } = highlightPluginInstance;

  // Create PDF URL when component mounts
  React.useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);

      // Cleanup URL when component unmounts
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  // Function to scroll to specific coordinates
  const scrollToPosition = React.useCallback(
    (coordinate: PDFCoordinate) => {
      if (!documentLoaded) return;

      // If clicking the same coordinate, clear the selection
      if (selectedCoordinate?.id === coordinate.id) {
        setSelectedCoordinate(null);
        return;
      }

      // Jump to the target page (pages are 0-indexed)
      jumpToPage(coordinate.page - 1);

      // Define the highlight area for coordinates
      const highlightArea = {
        pageIndex: coordinate.page - 1,
        left: coordinate.x,
        top: coordinate.y,
        width: coordinate.width,
        height: coordinate.height,
      };

      // Scroll to the defined area with a small delay to ensure page is loaded
      setTimeout(() => {
        jumpToHighlightArea(highlightArea);
      }, 300);

      setSelectedCoordinate(coordinate);
    },
    [documentLoaded, jumpToPage, jumpToHighlightArea, selectedCoordinate]
  );

  // Handle document load
  const handleDocumentLoad = React.useCallback(() => {
    setDocumentLoaded(true);
    console.log("PDF document loaded successfully");
  }, []);

  // Effect for handling coordinate scrolling from props
  React.useEffect(() => {
    if (scrollToCoordinates && documentLoaded) {
      scrollToPosition(scrollToCoordinates);
    }
  }, [scrollToCoordinates, documentLoaded, scrollToPosition]);

  // Download handler
  const handleDownload = React.useCallback(() => {
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [file.name, pdfUrl]);

  // Open in new tab
  const handleOpenInNewTab = React.useCallback(() => {
    window.open(pdfUrl, "_blank");
  }, [pdfUrl]);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Questions & Answers Panel */}
      <div className="lg:col-span-1">
        {extractedResults.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Extracted Information
              </CardTitle>
              <p className="text-sm text-gray-600">
                Found {extractedResults.length} key data points. Click to
                highlight in PDF.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
              {coordinates.map((coord) => (
                <motion.div
                  key={coord.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={
                      selectedCoordinate?.id === coord.id
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => scrollToPosition(coord)}
                    disabled={!documentLoaded}
                  >
                    <div className="flex flex-col items-start gap-1 w-full">
                      <div className="flex items-center gap-2 w-full">
                        <span className="font-medium text-sm text-blue-700">
                          {coord.label}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getCategoryColor(
                            coord.category
                          )}`}
                        >
                          Page {coord.page}
                        </Badge>
                      </div>

                      {coord.answer &&
                        coord.answer !==
                          "Information not found in lease document" && (
                          <div className="bg-gray-50 p-2 rounded text-xs text-gray-800 w-full">
                            <strong>Answer:</strong> {coord.answer}
                          </div>
                        )}

                      {coord.answer ===
                        "Information not found in lease document" && (
                        <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-700 w-full">
                          <strong>Not Found:</strong> Information not available
                          in document
                        </div>
                      )}

                      <div className="flex gap-2 text-xs text-gray-500 mt-1">
                        {coord.similarity && (
                          <span className="bg-green-100 text-green-700 px-1 rounded">
                            {coord.similarity.toFixed(0)}% confidence
                          </span>
                        )}
                        <span>Page {coord.page}</span>
                      </div>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Key Sections
              </CardTitle>
              <p className="text-sm text-gray-600">
                Upload a PDF to extract lease information automatically
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No analysis results yet</p>
                <p className="text-xs">
                  Upload a lease document to get started
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* PDF Viewer Panel */}
      <div className="lg:col-span-1">
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
                {documentLoaded && (
                  <Badge variant="outline" className="text-xs text-green-600">
                    Loaded & Highlighted
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
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
            <div className="w-full h-[700px] overflow-hidden">
              <Worker workerUrl="/pdf.worker.min.js">
                <Viewer
                  fileUrl={pdfUrl}
                  plugins={[
                    pageNavigationPluginInstance,
                    highlightPluginInstance,
                  ]}
                  onDocumentLoad={handleDocumentLoad}
                />
              </Worker>
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
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedCoordinate.answer ||
                        selectedCoordinate.description}
                    </p>
                    {selectedCoordinate.similarity && (
                      <div className="mb-2">
                        <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          {selectedCoordinate.similarity.toFixed(1)}% similarity
                          match
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 mt-2 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Position:</span>{" "}
                        {selectedCoordinate.x.toFixed(1)}% left,{" "}
                        {selectedCoordinate.y.toFixed(1)}% top
                      </div>
                      <div>
                        <span className="font-medium">Size:</span>{" "}
                        {selectedCoordinate.width.toFixed(1)}% ×{" "}
                        {selectedCoordinate.height.toFixed(1)}%
                      </div>
                    </div>
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
