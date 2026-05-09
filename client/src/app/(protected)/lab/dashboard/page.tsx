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
import {
  FlaskConical,
  Clock,
  CheckCircle,
  ArrowRight,
  FileUp,
} from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardItem } from "@/components/dashboard/DashboardItem";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { PendingLabTest } from "@/types";
import { format } from "date-fns";

export default function LabDashboard() {
  const { user, isLoading: authLoading } = useRequireAuth([
    "labstaff",
    "admin",
  ]);

  const { data, isLoading } = useQuery({
    queryKey: ["pendingLabTests"],
    queryFn: async () => {
      const res = await medicalRecordApi.getPendingLabTests(1, 50);
      return res;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  if (authLoading || isLoading) {
    return <DashboardSkeleton />;
  }

  const pendingTests = data?.data || [];
  const requestedCount = pendingTests.filter(
    (t: PendingLabTest) => t.labTest.status === "requested"
  ).length;
  const inProgressCount = pendingTests.filter(
    (t: PendingLabTest) =>
      t.labTest.status === "in-progress" ||
      t.labTest.status === "sample-collected"
  ).length;

  return (
    <div className="container py-8 space-y-10 animate-in fade-in duration-500">
      <DashboardHeader
        title="Diagnostics Node"
        description="Streamline specimen tracking and report certification in your high-throughput lab environment."
      >
        <Button
          asChild
          className="rounded-2xl h-12 px-6 font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all"
        >
          <Link href="/lab/pending">
            <FlaskConical className="mr-2 h-5 w-5" />
            Active Batches
          </Link>
        </Button>
      </DashboardHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Backlog"
          value={data?.pagination?.total}
          icon={FlaskConical}
          description="Awaiting certification"
          loading={isLoading}
        />
        <StatCard
          title="New Requests"
          value={requestedCount}
          icon={Clock}
          description="Sample collection pending"
          loading={isLoading}
          iconColor="text-yellow-600"
          iconClassName="bg-yellow-500/10"
        />
        <StatCard
          title="In Processing"
          value={inProgressCount}
          icon={CheckCircle}
          description="Analytical phase active"
          loading={isLoading}
          iconColor="text-blue-600"
          iconClassName="bg-blue-500/10"
        />
      </div>

      {/* Pending Tests List */}
      <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 flex flex-row items-center justify-between bg-white/30 backdrop-blur-sm">
          <div>
            <CardTitle className="text-2xl font-black tracking-tight">
              LABORATORY QUEUE
            </CardTitle>
            <CardDescription className="font-medium">
              Tests requiring immediate technical attention
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="rounded-full font-bold hover:bg-white/50"
          >
            <Link href="/lab/pending">
              VIEW FULL QUEUE <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {pendingTests.length > 0 ? (
            <div className="space-y-2">
              {pendingTests.slice(0, 5).map((test: PendingLabTest) => (
                <DashboardItem
                  key={`${test._id}-${test.labTest._id}`}
                  title={test.labTest.testName}
                  subtitle={`Patient: ${
                    test.patientName
                  } • Requested on ${format(
                    new Date(test.labTest.requestedAt),
                    "dd MMM yyyy"
                  )}`}
                  icon={FlaskConical}
                  iconBgColor="bg-purple-500/10"
                  iconColor="text-purple-600"
                  status={test.labTest.status}
                  statusVariant={
                    test.labTest.status === "requested"
                      ? "secondary"
                      : "default"
                  }
                  onClick={() => {}}
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="rounded-xl font-black border-primary/20 hover:bg-primary/10 transition-colors"
                    >
                      <Link
                        href={`/lab/upload/${test._id}/${test.labTest._id}`}
                      >
                        <FileUp className="h-4 w-4 mr-2" />
                        UPLOAD
                      </Link>
                    </Button>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-6">
              <div className="w-24 h-24 rounded-[2.5rem] bg-muted/20 flex items-center justify-center mx-auto opacity-50">
                <FlaskConical className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground">
                  Operational Efficiency: 100%
                </h3>
                <p className="text-muted-foreground font-medium">
                  All laboratory tests have been processed and certified.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
