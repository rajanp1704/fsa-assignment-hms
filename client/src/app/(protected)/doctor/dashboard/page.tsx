"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRequireAuth, useSocket } from "@/hooks";
import { appointmentApi, doctorApi } from "@/lib/services";
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
  Users,
  Clock,
  CheckCircle,
  Activity,
  ArrowRight,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardItem } from "@/components/dashboard/DashboardItem";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { Appointment } from "@/types";

export default function DoctorDashboard() {
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useRequireAuth(["doctor"]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["doctorProfile"],
    queryFn: async () => {
      const res = await doctorApi.getProfile();
      return res.data;
    },
    enabled: !!user,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["doctorStats"],
    queryFn: async () => {
      const res = await appointmentApi.getStats();
      return res.data;
    },
    enabled: !!user,
  });

  const { data: queue, isLoading: queueLoading } = useQuery({
    queryKey: ["doctorQueue"],
    queryFn: async () => {
      const res = await appointmentApi.getDoctorQueue();
      return res.data;
    },
    enabled: !!user,
  });

  const socket = useSocket(user?.role, user?.profile?._id);

  useEffect(() => {
    if (!socket) return;

    socket.on("newAppointment", () => {
      queryClient.invalidateQueries({ queryKey: ["doctorQueue"] });
      queryClient.invalidateQueries({ queryKey: ["doctorStats"] });
    });

    socket.on("queueUpdated", () => {
      queryClient.invalidateQueries({ queryKey: ["doctorQueue"] });
      queryClient.invalidateQueries({ queryKey: ["doctorStats"] });
    });

    return () => {
      socket.off("newAppointment");
      socket.off("queueUpdated");
    };
  }, [socket, queryClient]);

  if (authLoading || profileLoading) {
    return <DashboardSkeleton />;
  }

  const currentPatient = queue?.find(
    (apt: Appointment) => apt.status === "in-progress"
  );
  const pendingPatients =
    queue?.filter((apt: Appointment) => apt.status === "pending") || [];

  return (
    <div className="container py-8 space-y-10 animate-in fade-in duration-500">
      <DashboardHeader
        title={`Welcome, ${profile?.name || "Doctor"}!`}
        description={
          profile?.specialization ||
          "Manage your appointments and patient queue efficiently."
        }
      >
        <Button
          asChild
          className="rounded-2xl h-12 px-6 font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all"
        >
          <Link href="/doctor/queue">
            <Users className="mr-2 h-5 w-5" />
            Full Queue View
          </Link>
        </Button>
      </DashboardHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Scheduled Total"
          value={stats?.total}
          icon={Calendar}
          description="Appointments for today"
          loading={statsLoading}
        />
        <StatCard
          title="In Waiting"
          value={stats?.pending}
          icon={Clock}
          description="Patients in queue"
          loading={statsLoading}
          iconColor="text-yellow-600"
          iconClassName="bg-yellow-500/10"
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgress}
          icon={Activity}
          description="Active consultations"
          loading={statsLoading}
          iconColor="text-blue-600"
          iconClassName="bg-blue-500/10"
        />
        <StatCard
          title="Served"
          value={stats?.completed}
          icon={CheckCircle}
          description="Done today"
          loading={statsLoading}
          iconColor="text-green-600"
          iconClassName="bg-green-500/10"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Current Patient */}
        <Card
          className={`glass-card border-none rounded-[2.5rem] overflow-hidden ${
            currentPatient ? "ring-2 ring-primary/20" : ""
          }`}
        >
          <CardHeader className="p-8 bg-white/30 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-600">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black tracking-tight">
                  CURRENT PATIENT
                </CardTitle>
                <CardDescription className="font-medium">
                  Active clinical session
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {queueLoading ? (
              <Skeleton className="h-40 rounded-3xl" />
            ) : currentPatient ? (
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="text-3xl font-black text-white">
                      #{currentPatient.tokenNumber}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black tracking-tight">
                      {typeof currentPatient.patientId === "object"
                        ? currentPatient.patientId.name
                        : "Patient Name"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className="rounded-lg font-bold"
                      >
                        {typeof currentPatient.patientId === "object"
                          ? `${currentPatient.patientId.age} Years`
                          : "Age N/A"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="rounded-lg font-bold border-muted-foreground/30 capitalize"
                      >
                        {typeof currentPatient.patientId === "object"
                          ? currentPatient.patientId.gender
                          : "Gender"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="lg"
                    className="rounded-2xl h-14 px-8 font-black shadow-primary/20"
                  >
                    <Link href={`/doctor/checkup/${currentPatient._id}`}>
                      CONTINUE
                    </Link>
                  </Button>
                </div>
                {currentPatient.symptoms && (
                  <div className="p-6 bg-primary/5 rounded-[1.5rem] border border-primary/10">
                    <p className="text-sm font-black text-primary/60 uppercase tracking-widest mb-2">
                      Primary Symptoms
                    </p>
                    <p className="text-lg font-medium text-foreground/80 leading-relaxed italic line-clamp-2">
                      &quot;{currentPatient.symptoms}&quot;
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 space-y-6">
                <div className="w-24 h-24 rounded-[2.5rem] bg-muted/20 flex items-center justify-center mx-auto opacity-50">
                  <Users className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xl font-black text-muted-foreground">
                    Queue Resting
                  </p>
                  <p className="text-muted-foreground font-medium">
                    No active session currently in progress
                  </p>
                </div>
                {pendingPatients.length > 0 && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-2xl border-2 font-black"
                    asChild
                  >
                    <Link href="/doctor/queue">CALL NEXT PATIENT</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Queue Preview */}
        <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 flex flex-row items-center justify-between bg-white/30 backdrop-blur-sm">
            <div>
              <CardTitle className="text-2xl font-black tracking-tight">
                OPD QUEUE
              </CardTitle>
              <CardDescription className="font-medium">
                Upcoming consultations
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="rounded-full font-bold hover:bg-white/50"
            >
              <Link href="/doctor/queue">
                FULL LIST <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {queueLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
              </div>
            ) : pendingPatients.length > 0 ? (
              <div className="space-y-2">
                {pendingPatients.slice(0, 4).map((apt: Appointment) => (
                  <DashboardItem
                    key={apt._id}
                    title={
                      typeof apt.patientId === "object"
                        ? apt.patientId.name
                        : "Patient"
                    }
                    subtitle={apt.slot}
                    icon={Users}
                    status={apt.status}
                    token={apt.tokenNumber}
                    onClick={() => {}}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-muted-foreground opacity-50" />
                </div>
                <p className="font-bold text-muted-foreground italic">
                  Queue is currently clear
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
