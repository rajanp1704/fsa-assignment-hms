"use client";

import { useQuery } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks";
import { medicalRecordApi } from "@/lib/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, ExternalLink, ArrowLeft } from "lucide-react";
import { LabReport } from "@/types";
import { API_URL } from "@/config/appConfig";
import { format } from "date-fns";
import Link from "next/link";

export default function PatientReportsPage() {
  const { user, isLoading: authLoading } = useRequireAuth(["patient"]);

  const { data, isLoading } = useQuery({
    queryKey: ["myLabReports"],
    queryFn: async () => {
      const res = await medicalRecordApi.getMyLabReports(1, 50);
      return res;
    },
    enabled: !!user,
  });

  if (authLoading || isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const reports = data?.data || [];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link
          href="/patient/dashboard"
          className="text-primary hover:underline inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Lab Reports</h1>
        <p className="text-muted-foreground">
          View and download your lab test results
        </p>
      </div>

      {reports.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {reports.map((report: LabReport) => (
            <Card key={report._id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-green-100">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{report.testName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(report.createdAt, "dd MMM yyyy")}
                    </p>
                    {report.result && (
                      <p className="text-sm mt-2">
                        <strong>Result:</strong> {report.result}
                      </p>
                    )}
                    {report.normalRange && (
                      <p className="text-sm text-muted-foreground">
                        Normal Range: {report.normalRange}
                      </p>
                    )}
                    {report.remarks && (
                      <p className="text-sm mt-2 text-muted-foreground">
                        {report.remarks}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <a
                        href={`${API_URL}/${report.reportFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <a href={`${API_URL}/${report.reportFile}`} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No Lab Reports Yet</h3>
            <p className="text-muted-foreground">
              Your lab reports will appear here after your tests are completed
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
