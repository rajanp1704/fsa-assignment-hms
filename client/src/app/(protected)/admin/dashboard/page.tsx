"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserPlus,
  Stethoscope,
  UserCircle,
  FlaskConical,
  Search,
  ShieldCheck,
} from "lucide-react";
import { AxiosError } from "axios";
import { doctorApi, patientApi, authApi } from "@/lib/services";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardItem } from "@/components/dashboard/DashboardItem";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { CreateDoctorRequest, ApiResponse } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

const doctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  specialization: z.string().min(2, "Specialization is required"),
  qualification: z.string().min(2, "Qualification is required"),
  experience: z.number().min(0, "Experience must be a positive number"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  consultationFee: z.number().min(0, "Fee must be a positive number"),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: doctorsData, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ["admin", "doctors"],
    queryFn: () => doctorApi.getAllDoctors(1, 100),
  });

  const { data: patientsData, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["admin", "patients"],
    queryFn: () => patientApi.getAllPatients(1, 100),
  });

  const { data: labStaffData, isLoading: isLoadingLabStaff } = useQuery({
    queryKey: ["admin", "labstaff"],
    queryFn: () => authApi.getUsersByRole("labstaff", 1, 100),
  });

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      specialization: "",
      qualification: "",
      experience: 0,
      phone: "",
      consultationFee: 0,
    },
  });

  const createDoctorMutation = useMutation({
    mutationFn: (data: CreateDoctorRequest) => doctorApi.create(data),
    onSuccess: () => {
      toast.success("Doctor added successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "doctors"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: AxiosError<ApiResponse>) => {
      toast.error(error.response?.data?.message || "Failed to add doctor");
    },
  });

  const onSubmit = (values: DoctorFormValues) => {
    createDoctorMutation.mutate({
      ...values,
      opdTimings: [
        {
          day: "monday",
          startTime: "09:00",
          endTime: "17:00",
          maxPatients: 20,
        },
        {
          day: "tuesday",
          startTime: "09:00",
          endTime: "17:00",
          maxPatients: 20,
        },
        {
          day: "wednesday",
          startTime: "09:00",
          endTime: "17:00",
          maxPatients: 20,
        },
        {
          day: "thursday",
          startTime: "09:00",
          endTime: "17:00",
          maxPatients: 20,
        },
        {
          day: "friday",
          startTime: "09:00",
          endTime: "17:00",
          maxPatients: 20,
        },
      ],
    });
  };

  const isLoading = isLoadingDoctors || isLoadingPatients || isLoadingLabStaff;

  if (isLoading) return <DashboardSkeleton />;

  const filteredDoctors = doctorsData?.data?.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPatients = patientsData?.data?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLabStaff = labStaffData?.data?.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-8 space-y-10 animate-in fade-in duration-500">
      <DashboardHeader
        title="Admin Command Center"
        description="Monitor system activity and manage healthcare professionals."
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-12 px-6 font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all">
              <UserPlus className="h-5 w-5" />
              Add New Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] rounded-3xl backdrop-blur-xl bg-secondary/90 border-white/20 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
            <DialogHeader className="pt-4">
              <DialogTitle className="text-3xl font-black tracking-tighter">
                Register New Doctor
              </DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground">
                Enter professional details to create a new doctor account and
                profile.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 py-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Dr. John Doe"
                            {...field}
                            className="rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="doctor@gmail.com"
                            {...field}
                            className="rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temporary Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1 234 567 890"
                            {...field}
                            className="rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Cardiology"
                            {...field}
                            className="rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="qualification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualification</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="MD, PhD"
                            {...field}
                            className="rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience (Years)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="rounded-xl"
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="consultationFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consultation Fee ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="rounded-xl"
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    type="submit"
                    className="w-full rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-12"
                    disabled={createDoctorMutation.isPending}
                  >
                    {createDoctorMutation.isPending
                      ? "Registering..."
                      : "Complete Registration"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </DashboardHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Doctors"
          value={doctorsData?.pagination?.total || 0}
          icon={Stethoscope}
          description="Registered healthcare providers"
          iconColor="text-blue-500"
          iconBgColor="bg-blue-500/10"
        />
        <StatCard
          title="Total Patients"
          value={patientsData?.pagination?.total || 0}
          icon={UserCircle}
          description="Total medical profiles"
          iconColor="text-green-500"
          iconBgColor="bg-green-500/10"
        />
        <StatCard
          title="Lab Personnel"
          value={labStaffData?.pagination?.total || 0}
          icon={FlaskConical}
          description="Technicians & Staff"
          iconColor="text-purple-500"
          iconBgColor="bg-purple-500/10"
        />
        <StatCard
          title="System Status"
          value="Healthy"
          icon={ShieldCheck}
          description="All services operational"
          iconColor="text-emerald-500"
          iconBgColor="bg-emerald-500/10"
        />
      </div>

      <Card>
        <CardContent>
          <Tabs defaultValue="doctors" className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <TabsList className="bg-primary/5 p-1.5 rounded-2xl h-auto">
                <TabsTrigger
                  value="doctors"
                  className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all"
                >
                  Doctors
                </TabsTrigger>
                <TabsTrigger
                  value="patients"
                  className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all"
                >
                  Patients
                </TabsTrigger>
                <TabsTrigger
                  value="labstaff"
                  className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all"
                >
                  Lab Staff
                </TabsTrigger>
              </TabsList>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 rounded-2xl bg-primary/5 border-transparent focus:bg-white focus:border-primary/20 transition-all h-11"
                />
              </div>
            </div>

            <TabsContent value="doctors" className="mt-0">
              <div className="grid gap-4">
                {filteredDoctors?.length === 0 ? (
                  <div className="text-center py-12 bg-primary/5 rounded-[2rem] border-2 border-dashed border-primary/10">
                    <p className="text-muted-foreground font-medium">
                      No doctors found matching your search.
                    </p>
                  </div>
                ) : (
                  filteredDoctors?.map((doctor, index) => (
                    <DashboardItem
                      key={doctor._id + index}
                      title={doctor.name}
                      subtitle={`${doctor.specialization} • ${doctor.experience} years exp.`}
                      icon={Stethoscope}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="patients" className="mt-0">
              <div className="grid gap-4">
                {filteredPatients?.length === 0 ? (
                  <div className="text-center py-12 bg-primary/5 rounded-[2rem] border-2 border-dashed border-primary/10">
                    <p className="text-muted-foreground font-medium">
                      No patients found matching your search.
                    </p>
                  </div>
                ) : (
                  filteredPatients?.map((patient, index) => (
                    <DashboardItem
                      key={patient._id + index}
                      title={patient.name}
                      subtitle={`${patient.age} years • ${patient.gender}`}
                      icon={UserCircle}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="labstaff" className="mt-0">
              <div className="grid gap-4">
                {filteredLabStaff?.length === 0 ? (
                  <div className="text-center py-12 bg-primary/5 rounded-[2rem] border-2 border-dashed border-primary/10">
                    <p className="text-muted-foreground font-medium">
                      No lab staff found matching your search.
                    </p>
                  </div>
                ) : (
                  filteredLabStaff?.map((staff, index) => (
                    <DashboardItem
                      key={staff.id + index}
                      title={staff.email}
                      subtitle="Laboratory Technician"
                      icon={FlaskConical}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
