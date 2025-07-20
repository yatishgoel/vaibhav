"use client";

import React, { useState, useEffect } from "react";
import { LeaseAnalysis } from "@/entities/LeaseAnalysis";
import { motion } from "framer-motion";
import {
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  BarChart3,
  FolderKanban,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createPageUrl } from "@/utils";
import Layout from "@/components/layout";
interface LeaseAnalysisData {
  id?: string;
  lease_name: string;
  analysis_type: "abstract" | "benchmark";
  status: "processing" | "completed" | "failed";
  project_id?: string;
  created_date?: string;
}

export default function Dashboard() {
  const [analyses, setAnalyses] = useState<LeaseAnalysisData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const data = await LeaseAnalysis.list("-created_date", 10);
      setAnalyses(data);
    } catch (error) {
      console.error("Error loading analyses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout currentPageName="Dashboard">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back to LeaseFlow</p>
              </div>
              <div className="flex gap-3">
                <Link href={createPageUrl("AbstractAnalysis")}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <FileText className="w-4 h-4 mr-2" />
                    New Analysis
                  </Button>
                </Link>
                <Link href={createPageUrl("BenchmarkAnalysis")}>
                  <Button variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Benchmark
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    Abstract Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Upload a lease document and get instant intelligent
                    abstractions with key terms and clauses.
                  </p>
                  <Link href={createPageUrl("AbstractAnalysis")}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Start Analysis
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    Benchmark Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Compare multiple leases and generate comprehensive benchmark
                    reports for market analysis.
                  </p>
                  <Link href={createPageUrl("BenchmarkAnalysis")}>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Generate Benchmark
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Project Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <FolderKanban className="w-4 h-4 text-white" />
                  </div>
                  Organize with Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Group your analyses into projects for better tracking and
                  management.
                </p>
                <Link href={createPageUrl("Projects")}>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                    Go to Projects
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {analyses.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No analyses yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Upload your first lease document to get started with
                      intelligent analysis.
                    </p>
                    <Link href={createPageUrl("AbstractAnalysis")}>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Upload First Lease
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analyses.map((analysis) => (
                      <div
                        key={analysis.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              analysis.analysis_type === "abstract"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-purple-100 text-purple-600"
                            }`}
                          >
                            {analysis.analysis_type === "abstract" ? (
                              <FileText className="w-4 h-4" />
                            ) : (
                              <TrendingUp className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {analysis.lease_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {analysis.analysis_type === "abstract"
                                ? "Abstract Analysis"
                                : "Benchmark Analysis"}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            analysis.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : analysis.status === "processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {analysis.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
