"use client";

import { useQuery } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks";
import { patientApi, appointmentApi, medicalRecordApi } from "@/lib/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  FileText,
  Clock,
  ArrowRight,
  CalendarPlus,
  Activity,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardItem } from "@/components/dashboard/DashboardItem";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { Appointment, LabReport } from "@/types";
import { format } from "date-fns";

export default function PatientDashboard() {
  const { user, isLoading: authLoading } = useRequireAuth(["patient"]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["patientProfile"],
    queryFn: async () => {
      const res = await patientApi.getProfile();
      return res.data;
    },
    enabled: !!user,
  });

  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["myAppointments"],
    queryFn: async () => {
      const res = await appointmentApi.getMyAppointments(1, 5);
      return res;
    },
    enabled: !!user,
  });

  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ["myLabReports"],
    queryFn: async () => {
      const res = await medicalRecordApi.getMyLabReports(1, 5);
      return res;
    },
    enabled: !!user && !!profile,
  });

  if (authLoading || profileLoading) {
    return <DashboardSkeleton />;
  }

  const upcomingAppointments =
    appointmentsData?.data?.filter(
      (apt: Appointment) =>
        apt.status === "pending" || apt.status === "in-progress"
    ) || [];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "in-progress":
        return "default";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="container py-8 space-y-10 animate-in fade-in duration-500">
      <DashboardHeader
        title={`Welcome back${
          profile?.name ? `, ${profile.name.split(" ")[0]}` : ""
        }!`}
        description="Here's a premium overview of your health journey and upcoming tasks."
      >
        <Button
          asChild
          className="rounded-2xl h-12 px-6 font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all"
        >
          <Link href="/patient/appointments/book">
            <CalendarPlus className="mr-2 h-5 w-5" />
            New Appointment
          </Link>
        </Button>
      </DashboardHeader>

      {/* Profile Alert */}
      {!profile && !profileLoading && (
        <Card className="glass-card border-none bg-orange-500/10 p-1">
          <CardContent className="flex items-center gap-6 p-6">
            <div className="p-4 rounded-2xl bg-orange-500/20">
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-orange-900">
                Profiles Incomplete
              </h3>
              <p className="text-orange-800/70 font-medium">
                Please finalize your medical profile to enable all healthcare
                features.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-orange-500/50 text-orange-700 hover:bg-orange-500/10 font-bold"
            >
              <Link href="/patient/profile">Setup Now</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Consultations"
          value={appointmentsData?.pagination?.total}
          icon={Calendar}
          description={`${upcomingAppointments.length} sessions scheduled`}
          loading={appointmentsLoading}
        />
        <StatCard
          title="Medical Reports"
          value={reportsData?.pagination?.total}
          icon={FileText}
          description="Available for instant download"
          loading={reportsLoading}
        />
        <StatCard
          title="Health Index"
          value="EXCELLENT"
          icon={Activity}
          description="Based on your latest diagnostics"
          iconClassName="bg-green-500/10"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 flex flex-row items-center justify-between bg-white/30 backdrop-blur-sm">
            <div>
              <CardTitle className="text-2xl font-black tracking-tight">
                UPCOMING EVENTS
              </CardTitle>
              <CardDescription className="font-medium">
                Scheduled consultations
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="rounded-full font-bold hover:bg-white/50"
            >
              <Link href="/patient/appointments">
                EXPLORE ALL <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {appointmentsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-2">
                {upcomingAppointments.slice(0, 3).map((apt: Appointment) => (
                  <DashboardItem
                    key={apt._id}
                    title={
                      typeof apt.doctorId === "object"
                        ? apt.doctorId.name
                        : "Doctor"
                    }
                    subtitle={`${format(
                      new Date(apt.date),
                      "dd MMM yyyy"
                    )} at ${apt.slot}`}
                    icon={Clock}
                    status={apt.status}
                    statusVariant={getStatusVariant(apt.status)}
                    onClick={() => {}}
                    action={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-10 w-10 text-muted-foreground opacity-50" />
                </div>
                <p className="font-bold text-muted-foreground">
                  No upcoming appointments found
                </p>
                <Button
                  variant="link"
                  asChild
                  className="font-black text-primary"
                >
                  <Link href="/patient/appointments/book text-primary">
                    Schedule your first visit
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Lab Reports */}
        <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 flex flex-row items-center justify-between bg-white/30 backdrop-blur-sm">
            <div>
              <CardTitle className="text-2xl font-black tracking-tight">
                DIAGNOSTICS
              </CardTitle>
              <CardDescription className="font-medium">
                Recent laboratory results
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="rounded-full font-bold hover:bg-white/50"
            >
              <Link href="/patient/reports">
                REPORTS <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {reportsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
              </div>
            ) : reportsData?.data && reportsData.data.length > 0 ? (
              <div className="space-y-2">
                {reportsData.data.slice(0, 3).map((report: LabReport) => (
                  <DashboardItem
                    key={report._id}
                    title={report.testName}
                    subtitle={format(new Date(report.createdAt), "dd MMM yyyy")}
                    icon={FileText}
                    iconBgColor="bg-green-500/10"
                    iconColor="text-green-600"
                    onClick={() => {}}
                    action={
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl font-black border-green-500/20 text-green-700 bg-green-500/5 hover:bg-green-500/10"
                      >
                        VIEW
                      </Button>
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 text-muted-foreground opacity-50" />
                </div>
                <p className="font-bold text-muted-foreground">
                  No diagnostic results yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
