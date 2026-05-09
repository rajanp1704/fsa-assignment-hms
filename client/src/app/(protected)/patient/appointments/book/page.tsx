"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks";
import { doctorApi, appointmentApi, patientApi } from "@/lib/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  Check,
  Clock,
  User,
  Loader2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Doctor } from "@/types";
import Link from "next/link";

const bookingSchema = z.object({
  doctorId: z.string().min(1, "Please select a doctor"),
  date: z.date(),
  slot: z.string().min(1, "Please select a time slot"),
  symptoms: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookAppointmentPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useRequireAuth(["patient"]);
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Check if patient has profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["patientProfile"],
    queryFn: async () => {
      const res = await patientApi.getProfile();
      return res.data;
    },
    enabled: !!user,
    retry: false,
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      doctorId: "",
      slot: "",
      symptoms: "",
    },
  });

  const selectedDate = form.watch("date");
  const selectedSlot = form.watch("slot");

  // Fetch doctors
  const { data: doctorsData, isLoading: doctorsLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const res = await doctorApi.getAllDoctors(1, 50);
      return res;
    },
  });

  // Fetch available slots
  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ["doctorSlots", selectedDoctor?._id, selectedDate],
    queryFn: async () => {
      if (!selectedDoctor || !selectedDate) return null;
      const res = await doctorApi.getAvailableSlots(
        selectedDoctor._id,
        format(selectedDate, "yyyy-MM-dd")
      );
      return res.data;
    },
    enabled: !!selectedDoctor && !!selectedDate,
  });

  const bookMutation = useMutation({
    mutationFn: (data: BookingFormData) =>
      appointmentApi.create({
        doctorId: data.doctorId,
        date: format(data.date, "yyyy-MM-dd"),
        slot: data.slot,
        symptoms: data.symptoms,
      }),
    onSuccess: () => {
      toast.success("Appointment booked successfully!");
      router.push("/patient/appointments");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to book appointment"
      );
    },
  });

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    form.setValue("doctorId", doctor._id);
    setStep(2);
  };

  const handleSlotSelect = (slot: string) => {
    form.setValue("slot", slot);
  };

  const onSubmit = (data: BookingFormData) => {
    bookMutation.mutate(data);
  };

  if (authLoading || profileLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  // Show profile required message
  if (!profile) {
    return (
      <div className="container py-8 max-w-2xl">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
            <h2 className="text-xl font-semibold mb-2">
              Complete Your Profile First
            </h2>
            <p className="text-muted-foreground mb-6">
              You need to complete your profile before booking an appointment.
            </p>
            <Button asChild>
              <Link href="/patient/profile">Complete Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableSlots =
    slotsData?.slots?.filter(
      (slot: string) => !slotsData.bookedSlots?.includes(slot)
    ) || [];

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
        <h1 className="text-3xl font-bold">Book an Appointment</h1>
        <p className="text-muted-foreground">
          Select a doctor and choose your preferred time slot
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-medium",
              step >= 1
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            {step > 1 ? <Check className="h-5 w-5" /> : "1"}
          </div>
          <span className="ml-2 font-medium">Select Doctor</span>
        </div>
        <div
          className={cn("w-16 h-1 mx-4", step >= 2 ? "bg-primary" : "bg-muted")}
        />
        <div className="flex items-center">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-medium",
              step >= 2
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            {step > 2 ? <Check className="h-5 w-5" /> : "2"}
          </div>
          <span className="ml-2 font-medium">Choose Slot</span>
        </div>
        <div
          className={cn("w-16 h-1 mx-4", step >= 3 ? "bg-primary" : "bg-muted")}
        />
        <div className="flex items-center">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-medium",
              step >= 3
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            3
          </div>
          <span className="ml-2 font-medium">Confirm</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Step 1: Select Doctor */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Select a Doctor</h2>
              {doctorsLoading ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <Skeleton className="h-40" />
                  <Skeleton className="h-40" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {doctorsData?.data?.map((doctor: Doctor) => (
                    <Card
                      key={doctor._id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedDoctor?._id === doctor._id &&
                          "ring-2 ring-primary"
                      )}
                      onClick={() => handleDoctorSelect(doctor)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex gap-4">
                          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-7 w-7 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{doctor.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {doctor.specialization}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {doctor.qualification}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary">
                                ₹{doctor.consultationFee}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {doctor.experience} yrs exp
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Date & Slot */}
          {step === 2 && selectedDoctor && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Select Date & Time</h2>
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Change Doctor
                </Button>
              </div>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedDoctor.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedDoctor.specialization}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? format(field.value, "PPP")
                                  : "Pick a date"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() ||
                                date >
                                  new Date(
                                    Date.now() + 30 * 24 * 60 * 60 * 1000
                                  )
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="slot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Time Slot</FormLabel>
                        {!selectedDate ? (
                          <p className="text-sm text-muted-foreground">
                            Please select a date first
                          </p>
                        ) : slotsLoading ? (
                          <div className="grid grid-cols-3 gap-2">
                            <Skeleton className="h-10" />
                            <Skeleton className="h-10" />
                            <Skeleton className="h-10" />
                          </div>
                        ) : availableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                            {availableSlots.map((slot: string) => (
                              <Button
                                key={slot}
                                type="button"
                                variant={
                                  field.value === slot ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => handleSlotSelect(slot)}
                              >
                                <Clock className="mr-1 h-3 w-3" />
                                {slot}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No slots available for this date
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {selectedDate && selectedSlot && (
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full md:w-auto"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && selectedDoctor && selectedDate && selectedSlot && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Confirm Appointment</h2>
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Change Time
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Appointment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedDoctor.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedDoctor.specialization}
                      </p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {format(selectedDate, "PPP")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">{selectedSlot}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Consultation Fee
                      </p>
                      <p className="font-medium">
                        ₹{selectedDoctor.consultationFee}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Symptoms / Reason for Visit (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your symptoms or reason for visiting..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                disabled={bookMutation.isPending}
                className="w-full"
              >
                {bookMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
