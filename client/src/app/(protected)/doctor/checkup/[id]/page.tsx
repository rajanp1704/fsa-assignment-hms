"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks";
import { appointmentApi, medicalRecordApi } from "@/lib/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  Phone,
  AlertCircle,
  Plus,
  Trash2,
  Loader2,
  Stethoscope,
  Pill,
  FlaskConical,
  FileText,
} from "lucide-react";
import { Patient } from "@/types";

const checkupSchema = z.object({
  symptoms: z.array(z.string()).min(1, "At least one symptom is required"),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  notes: z.string().optional(),
  vitalSigns: z
    .object({
      bloodPressure: z.string().optional(),
      temperature: z.string().optional(),
      pulse: z.string().optional(),
      weight: z.string().optional(),
      height: z.string().optional(),
    })
    .optional(),
  prescriptions: z.array(
    z.object({
      medicineName: z.string().min(1, "Medicine name is required"),
      dosage: z.string().min(1, "Dosage is required"),
      frequency: z.string().min(1, "Frequency is required"),
      duration: z.string().min(1, "Duration is required"),
      instructions: z.string().optional(),
    })
  ),
  labTestsRequested: z.array(
    z.object({
      testName: z.string().min(1, "Test name is required"),
    })
  ),
  followUpDate: z.string().optional(),
});

type CheckupFormData = z.infer<typeof checkupSchema>;

export default function DoctorCheckupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useRequireAuth(["doctor"]);
  const [symptomsInput, setSymptomsInput] = useState("");

  const { data: appointment, isLoading: appointmentLoading } = useQuery({
    queryKey: ["appointment", id],
    queryFn: async () => {
      const res = await appointmentApi.getById(id);
      return res.data;
    },
    enabled: !!user && !!id,
  });

  const form = useForm<CheckupFormData>({
    resolver: zodResolver(checkupSchema),
    defaultValues: {
      symptoms: [],
      diagnosis: "",
      notes: "",
      vitalSigns: {},
      prescriptions: [],
      labTestsRequested: [],
      followUpDate: "",
    },
  });

  const {
    fields: prescriptionFields,
    append: appendPrescription,
    remove: removePrescription,
  } = useFieldArray({
    control: form.control,
    name: "prescriptions",
  });

  const {
    fields: labTestFields,
    append: appendLabTest,
    remove: removeLabTest,
  } = useFieldArray({
    control: form.control,
    name: "labTestsRequested",
  });

  const symptoms = form.watch("symptoms");

  const createRecordMutation = useMutation({
    mutationFn: (data: CheckupFormData) =>
      medicalRecordApi.create({
        appointmentId: id,
        symptoms: data.symptoms,
        diagnosis: data.diagnosis,
        notes: data.notes,
        vitalSigns: data.vitalSigns,
        prescriptions: data.prescriptions,
        labTestsRequested: data.labTestsRequested,
        followUpDate: data.followUpDate,
      }),
    onSuccess: () => {
      toast.success("Checkup completed successfully!");
      queryClient.invalidateQueries({ queryKey: ["doctorQueue"] });
      queryClient.invalidateQueries({ queryKey: ["doctorStats"] });
      router.push("/doctor/queue");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save checkup");
    },
  });

  const addSymptom = () => {
    if (symptomsInput.trim()) {
      form.setValue("symptoms", [...symptoms, symptomsInput.trim()]);
      setSymptomsInput("");
    }
  };

  const removeSymptom = (index: number) => {
    const updated = symptoms.filter((_, i) => i !== index);
    form.setValue("symptoms", updated);
  };

  const onSubmit = (data: CheckupFormData) => {
    createRecordMutation.mutate(data);
  };

  if (authLoading || appointmentLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="font-semibold">Appointment not found</h3>
            <Button variant="link" asChild className="mt-2">
              <Link href="/doctor/queue">Back to Queue</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const patient = appointment.patientId as Patient;

  return (
    <div className="container py-8">
      <Link
        href="/doctor/queue"
        className="text-primary hover:underline inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Queue
      </Link>

      <h1 className="text-3xl font-bold mb-8">Patient Checkup</h1>

      {/* Patient Info Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Patient Name</p>
                <p className="font-semibold">{patient?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age / Gender</p>
                <p className="font-semibold">
                  {patient?.age} years, {patient?.gender}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-semibold flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {patient?.phone}
                </p>
              </div>
              {patient?.bloodGroup && (
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <Badge variant="outline">{patient.bloodGroup}</Badge>
                </div>
              )}
              {patient?.medicalHistory && patient.medicalHistory.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Medical History
                  </p>
                  <p className="text-sm">{patient.medicalHistory.join(", ")}</p>
                </div>
              )}
              {patient?.allergies && patient.allergies.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    Allergies
                  </p>
                  <p className="text-sm text-red-600">
                    {patient.allergies.join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>
          {appointment.symptoms && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Patient's Complaint:</strong> {appointment.symptoms}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Vital Signs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Vital Signs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <FormField
                  control={form.control}
                  name="vitalSigns.bloodPressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Pressure</FormLabel>
                      <FormControl>
                        <Input placeholder="120/80" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vitalSigns.temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperature (°F)</FormLabel>
                      <FormControl>
                        <Input placeholder="98.6" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vitalSigns.pulse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pulse (bpm)</FormLabel>
                      <FormControl>
                        <Input placeholder="72" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vitalSigns.weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input placeholder="70" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vitalSigns.height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input placeholder="170" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Symptoms & Diagnosis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Symptoms & Diagnosis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="symptoms"
                render={() => (
                  <FormItem>
                    <FormLabel>Symptoms *</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        value={symptomsInput}
                        onChange={(e) => setSymptomsInput(e.target.value)}
                        placeholder="Enter symptom and press Add"
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addSymptom())
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addSymptom}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {symptoms.map((symptom, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {symptom}
                          <button
                            type="button"
                            onClick={() => removeSymptom(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter diagnosis" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes or observations"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Prescriptions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Prescriptions
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendPrescription({
                    medicineName: "",
                    dosage: "",
                    frequency: "",
                    duration: "",
                    instructions: "",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add Medicine
              </Button>
            </CardHeader>
            <CardContent>
              {prescriptionFields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No prescriptions added
                </p>
              ) : (
                <div className="space-y-4">
                  {prescriptionFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          Medicine #{index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrescription(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`prescriptions.${index}.medicineName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medicine Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Paracetamol"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`prescriptions.${index}.dosage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dosage</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 500mg" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`prescriptions.${index}.frequency`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequency</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Twice daily"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`prescriptions.${index}.duration`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 5 days" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name={`prescriptions.${index}.instructions`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Take after meals"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lab Tests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Lab Tests
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendLabTest({ testName: "" })}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Test
              </Button>
            </CardHeader>
            <CardContent>
              {labTestFields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No lab tests requested
                </p>
              ) : (
                <div className="space-y-3">
                  {labTestFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3">
                      <FormField
                        control={form.control}
                        name={`labTestsRequested.${index}.testName`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="e.g., Complete Blood Count"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLabTest(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Follow Up */}
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="followUpDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={createRecordMutation.isPending}
          >
            {createRecordMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Checkup...
              </>
            ) : (
              "Complete Checkup"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
