"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks";
import { appointmentApi } from "@/lib/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  User,
  X,
  CalendarPlus,
  ArrowLeft,
} from "lucide-react";
import { Appointment } from "@/types";
import { format } from "date-fns";

export default function PatientAppointmentsPage() {
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useRequireAuth(["patient"]);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["myAppointments"],
    queryFn: async () => {
      const res = await appointmentApi.getMyAppointments(1, 50);
      return res;
    },
    enabled: !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentApi.cancel(id),
    onSuccess: () => {
      toast.success("Appointment cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["myAppointments"] });
      setCancelId(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to cancel appointment"
      );
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

  const appointments = data?.data || [];
  const upcomingAppointments = appointments.filter(
    (apt: Appointment) =>
      apt.status === "pending" || apt.status === "in-progress"
  );
  const pastAppointments = appointments.filter(
    (apt: Appointment) =>
      apt.status === "completed" || apt.status === "cancelled"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const doctor =
      typeof appointment.doctorId === "object" ? appointment.doctorId : null;

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {doctor?.name || "Doctor"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {doctor?.specialization || "Specialist"}
                  </p>
                </div>
                <Badge className={getStatusColor(appointment.status)}>
                  {appointment.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(appointment.date, "dd MMM yyyy")}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {appointment.slot}
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">
                    Token: #{appointment.tokenNumber}
                  </span>
                </div>
              </div>
              {appointment.symptoms && (
                <p className="text-sm text-muted-foreground">
                  <strong>Symptoms:</strong> {appointment.symptoms}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {appointment.status === "pending" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setCancelId(appointment._id)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
              {appointment.status === "completed" && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/patient/appointments/${appointment._id}`}>
                    View Details
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <Link
            href="/patient/dashboard"
            className="text-primary hover:underline inline-flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground">
            View and manage your appointments
          </p>
        </div>
        <Button asChild>
          <Link href="/patient/appointments/book">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Book Appointment
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((apt: Appointment) => (
              <AppointmentCard key={apt._id} appointment={apt} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-2">No upcoming appointments</h3>
                <p className="text-muted-foreground mb-4">
                  Book an appointment with a doctor to get started
                </p>
                <Button asChild>
                  <Link href="/patient/appointments/book">
                    Book Appointment
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length > 0 ? (
            pastAppointments.map((apt: Appointment) => (
              <AppointmentCard key={apt._id} appointment={apt} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-2">No past appointments</h3>
                <p className="text-muted-foreground">
                  Your completed and cancelled appointments will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelId(null)}>
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelId && cancelMutation.mutate(cancelId)}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending
                ? "Cancelling..."
                : "Cancel Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
