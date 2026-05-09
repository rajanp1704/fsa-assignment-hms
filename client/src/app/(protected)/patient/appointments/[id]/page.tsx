"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { appointmentApi } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { Doctor, Patient } from "@/types";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const AppointmentsById = ({ params }: PageProps) => {
  const { id } = use(params);

  const { data: appointment, isLoading: appointmentLoading } = useQuery({
    queryKey: ["appointment", id],
    queryFn: async () => {
      const response = await appointmentApi.getById(id);
      return response?.data;
    },
    enabled: !!id,
  });

  if (appointmentLoading) {
    return <div className="container py-8">Loading...</div>;
  }

  if (!appointment) {
    return <div className="container py-8">Appointment not found.</div>;
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link
          href="/patient/appointments"
          className="text-primary hover:underline inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Appointments
        </Link>
        <h1 className="text-3xl font-bold">Appointment Details</h1>
        <p className="text-muted-foreground">View your appointment details</p>
      </div>
      <Card className="mb-6">
        <CardHeader className="text-center text-lg font-bold">
          Appointment Details
        </CardHeader>
        <CardContent>
          <p>
            <strong>Date:</strong>{" "}
            {format(new Date(appointment.date), "dd MMM yyyy")}
          </p>
          <p>
            <strong>Slot:</strong> {appointment.slot}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="capitalize">{appointment.status}</span>
          </p>
          {appointment.symptoms && (
            <p>
              <strong>Symptoms:</strong> {appointment.symptoms}
            </p>
          )}
          {appointment.notes && (
            <p>
              <strong>Doctor Notes:</strong> {appointment.notes}
            </p>
          )}
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader className="text-center text-lg font-bold">
          Doctor Info
        </CardHeader>
        <CardContent>
          <p>
            <strong>Name:</strong> {(appointment.doctorId as Doctor).name}
          </p>
          <p>
            <strong>Specialization:</strong>{" "}
            {(appointment.doctorId as Doctor).specialization}
          </p>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader className="text-center text-lg font-bold">
          Patient Info
        </CardHeader>
        <CardContent>
          <p>
            <strong>Name:</strong> {(appointment.patientId as Patient).name}
          </p>
          <p>
            <strong>Phone:</strong> {(appointment.patientId as Patient).phone}
          </p>
          {(appointment.patientId as Patient).gender && (
            <p>
              <strong>Gender:</strong>{" "}
              {(appointment.patientId as Patient).gender}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentsById;
