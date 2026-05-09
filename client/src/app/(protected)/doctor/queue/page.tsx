"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRequireAuth, useSocket } from "@/hooks";
import { appointmentApi } from "@/lib/services";
import { AxiosError } from "axios";
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
  Play,
  ArrowRight,
  Phone,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Appointment, Patient } from "@/types";

export default function DoctorQueuePage() {
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useRequireAuth(["doctor"]);

  const { data: queue, isLoading } = useQuery({
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

    const handleNewAppointment = () => {
      toast.info("A new patient has booked an appointment!");
      queryClient.invalidateQueries({ queryKey: ["doctorQueue"] });
      queryClient.invalidateQueries({ queryKey: ["doctorStats"] });
    };

    const handleQueueUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["doctorQueue"] });
    };

    socket.on("newAppointment", handleNewAppointment);
    socket.on("queueUpdated", handleQueueUpdate);

    return () => {
      socket.off("newAppointment", handleNewAppointment);
      socket.off("queueUpdated", handleQueueUpdate);
    };
  }, [socket, queryClient]);

  const callNextMutation = useMutation({
    mutationFn: (id: string) => appointmentApi.updateStatus(id, "in-progress"),
    onSuccess: () => {
      toast.success("Patient called. Ready for checkup.");
      queryClient.invalidateQueries({ queryKey: ["doctorQueue"] });
      queryClient.invalidateQueries({ queryKey: ["doctorStats"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
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
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const currentPatient = queue?.find(
    (apt: Appointment) => apt.status === "in-progress"
  );
  const pendingPatients =
    queue?.filter((apt: Appointment) => apt.status === "pending") || [];

  const getNextPatient = () => {
    if (pendingPatients.length > 0) {
      callNextMutation.mutate(pendingPatients[0]._id);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <Link
            href="/doctor/dashboard"
            className="text-primary hover:underline inline-flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">OPD Queue</h1>
          <CardDescription>
            Manage today&apos;s patient appointments
          </CardDescription>
        </div>
        {!currentPatient && pendingPatients.length > 0 && (
          <Button
            onClick={getNextPatient}
            disabled={callNextMutation.isPending}
          >
            <Play className="mr-2 h-4 w-4" />
            Call Next Patient
          </Button>
        )}
      </div>

      {/* Current Patient Card */}
      {currentPatient && (
        <Card className="mb-8 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                <CardTitle>Currently Attending</CardTitle>
              </div>
              <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">
                    #{currentPatient.tokenNumber}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-xl">
                    {typeof currentPatient.patientId === "object"
                      ? (currentPatient.patientId as Patient).name
                      : "Patient"}
                  </h3>
                  {typeof currentPatient.patientId === "object" && (
                    <>
                      <p className="text-muted-foreground">
                        {(currentPatient.patientId as Patient).age} years,{" "}
                        {(currentPatient.patientId as Patient).gender}
                      </p>
                      <p className="text-sm flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" />
                        {(currentPatient.patientId as Patient).phone}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-2">
                {currentPatient.symptoms && (
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-sm font-medium">Symptoms:</p>
                    <p className="text-sm text-muted-foreground">
                      {currentPatient.symptoms}
                    </p>
                  </div>
                )}
                {typeof currentPatient.patientId === "object" &&
                  ((currentPatient.patientId as Patient).medicalHistory
                    ?.length || 0) > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                      <span>
                        <strong>Medical History:</strong>{" "}
                        {(
                          currentPatient.patientId as Patient
                        ).medicalHistory?.join(", ")}
                      </span>
                    </div>
                  )}
                {typeof currentPatient.patientId === "object" &&
                  ((currentPatient.patientId as Patient).allergies?.length ||
                    0) > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                      <span>
                        <strong>Allergies:</strong>{" "}
                        {(currentPatient.patientId as Patient).allergies?.join(
                          ", "
                        )}
                      </span>
                    </div>
                  )}
              </div>

              <Button size="lg" asChild>
                <Link href={`/doctor/checkup/${currentPatient._id}`}>
                  Start Checkup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queue List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Waiting Queue
              </CardTitle>
              <CardDescription>
                {pendingPatients.length} patient
                {pendingPatients.length !== 1 ? "s" : ""} waiting
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pendingPatients.length > 0 ? (
            <div className="space-y-4">
              {pendingPatients.map((apt: Appointment, index: number) => {
                const patient = apt.patientId as Patient;
                return (
                  <div
                    key={apt._id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      index === 0 ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        index === 0 ? "bg-primary text-white" : "bg-muted"
                      }`}
                    >
                      <span className="font-bold">#{apt.tokenNumber}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {typeof patient === "object"
                            ? patient.name
                            : "Patient"}
                        </h4>
                        {index === 0 && <Badge variant="outline">Next</Badge>}
                      </div>
                      {typeof patient === "object" && (
                        <p className="text-sm text-muted-foreground">
                          {patient.age} yrs, {patient.gender} • {apt.slot}
                        </p>
                      )}
                      {apt.symptoms && (
                        <p className="text-sm text-muted-foreground mt-1 truncate max-w-md">
                          {apt.symptoms}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {apt.slot}
                    </div>
                    {index === 0 && !currentPatient && (
                      <Button
                        size="sm"
                        onClick={() => callNextMutation.mutate(apt._id)}
                        disabled={callNextMutation.isPending}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">Queue is Empty</h3>
              <p className="text-muted-foreground">
                No patients waiting at the moment
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
