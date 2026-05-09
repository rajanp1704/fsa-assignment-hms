"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlaskConical, FileUp, User, ArrowLeft } from "lucide-react";
import { PendingLabTest } from "@/types";

export default function PendingLabTestsPage() {
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useRequireAuth([
    "labstaff",
    "admin",
  ]);

  const { data, isLoading } = useQuery({
    queryKey: ["pendingLabTests"],
    queryFn: async () => {
      const res = await medicalRecordApi.getPendingLabTests(1, 100);
      return res;
    },
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      recordId,
      testId,
      status,
    }: {
      recordId: string;
      testId: string;
      status: string;
    }) => medicalRecordApi.updateLabTestStatus(recordId, testId, status),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["pendingLabTests"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
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

  const pendingTests = data?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "requested":
        return "bg-yellow-100 text-yellow-800";
      case "sample-collected":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link
          href="/lab/dashboard"
          className="text-primary hover:underline inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Pending Lab Tests</h1>
        <p className="text-muted-foreground">
          {pendingTests.length} test{pendingTests.length !== 1 ? "s" : ""}{" "}
          pending
        </p>
      </div>

      {pendingTests.length > 0 ? (
        <div className="space-y-4">
          {pendingTests.map((test: PendingLabTest) => (
            <Card key={`${test._id}-${test.labTest._id}`}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="p-4 rounded-full bg-purple-100 flex-shrink-0">
                    <FlaskConical className="h-6 w-6 text-purple-600" />
                  </div>

                  <div className="flex-1 grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Test Name</p>
                      <p className="font-semibold">{test.labTest.testName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Patient</p>
                      <p className="font-medium flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {test.patientName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Requested By
                      </p>
                      <p className="font-medium">Dr. {test.doctorName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Select
                      defaultValue={test.labTest.status}
                      onValueChange={(value) =>
                        updateStatusMutation.mutate({
                          recordId: test._id,
                          testId: test.labTest._id!,
                          status: value,
                        })
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="requested">Requested</SelectItem>
                        <SelectItem value="sample-collected">
                          Sample Collected
                        </SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button asChild>
                      <Link
                        href={`/lab/upload/${test._id}/${test.labTest._id}`}
                      >
                        <FileUp className="h-4 w-4 mr-1" />
                        Upload Report
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    Requested:{" "}
                    {new Date(test.labTest.requestedAt).toLocaleString()}
                  </span>
                  <Badge className={getStatusColor(test.labTest.status)}>
                    {test.labTest.status.replace("-", " ")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FlaskConical className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No Pending Tests</h3>
            <p className="text-muted-foreground">
              All lab tests have been completed
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
