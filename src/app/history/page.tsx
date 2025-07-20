"use client";

import React, { useState, useEffect } from "react";
import { LeaseAnalysis } from "@/entities/LeaseAnalysis";
import { Project } from "@/entities/Project";
import { motion } from "framer-motion";
import Link from "next/link";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  TrendingUp,
  Clock as ClockIcon,
  FolderKanban,
} from "lucide-react";
import { format } from "date-fns";
import Layout from "@/components/layout";

interface ProjectData {
  id?: string;
  name: string;
  description?: string;
  created_date?: string;
}

interface AnalysisData {
  id?: string;
  lease_name: string;
  analysis_type: "abstract" | "benchmark";
  status: "processing" | "completed" | "failed";
  project_id?: string;
  created_date?: string;
}

export default function History() {
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [projects, setProjects] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analysesData, projectsData] = await Promise.all([
          LeaseAnalysis.list("-created_date"),
          Project.list(),
        ]);

        setAnalyses(analysesData);

        const projectsMap = projectsData.reduce(
          (acc: Record<string, string>, proj: ProjectData) => {
            acc[proj.id!] = proj.name;
            return acc;
          },
          {} as Record<string, string>
        );
        setProjects(projectsMap);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Layout currentPageName="History">
        <div className="p-8">Loading history...</div>
      </Layout>
    );
  }

  return (
    <Layout currentPageName="History">
      <div className="min-h-screen ">
        <div className="max-w-7xl mx-auto p-6 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className=" rounded-t-lg px-6 py-5">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <ClockIcon className="w-6 h-6" /> Analysis History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto ml-2 mr-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lease</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyses.length > 0 ? (
                        analyses.map((analysis) => (
                          <TableRow key={analysis.id}>
                            <TableCell className="font-medium">
                              {analysis.lease_name}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1.5 capitalize"
                              >
                                {analysis.analysis_type === "abstract" ? (
                                  <FileText className="w-3 h-3 text-blue-600" />
                                ) : (
                                  <TrendingUp className="w-3 h-3 text-purple-600" />
                                )}
                                {analysis.analysis_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {analysis.project_id &&
                              projects[analysis.project_id] ? (
                                <Link
                                  href={`/projects/${analysis.project_id}`}
                                  className="text-blue-600 hover:underline flex items-center gap-1.5"
                                >
                                  <FolderKanban className="w-4 h-4" />
                                  {projects[analysis.project_id]}
                                </Link>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {analysis.created_date
                                ? format(
                                    new Date(analysis.created_date),
                                    "MMM d, yyyy"
                                  )
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${getStatusBadge(
                                  analysis.status
                                )} capitalize`}
                              >
                                {analysis.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-16 text-gray-500"
                          >
                            <div className="flex flex-col items-center gap-3">
                              <ClockIcon className="w-12 h-12 text-gray-300" />
                              <div>
                                <h3 className="font-medium text-gray-700 mb-1">
                                  No analysis history yet
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Start analyzing leases to see your history
                                  here.
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
