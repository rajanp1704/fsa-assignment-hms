"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { ArrowLeft, Upload, FileUp, Loader2, File } from "lucide-react";

const uploadSchema = z.object({
  testName: z.string().min(1, "Test name is required"),
  result: z.string().optional(),
  normalRange: z.string().optional(),
  remarks: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

export default function UploadLabReportPage({
  params,
}: {
  params: Promise<{ recordId: string; testId: string }>;
}) {
  const { recordId, testId } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useRequireAuth([
    "labstaff",
    "admin",
  ]);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      testName: "",
      result: "",
      normalRange: "",
      remarks: "",
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData) => {
      if (!file) throw new Error("Please select a file");

      const formData = new FormData();
      formData.append("report", file);
      formData.append("testName", data.testName);
      if (data.result) formData.append("result", data.result);
      if (data.normalRange) formData.append("normalRange", data.normalRange);
      if (data.remarks) formData.append("remarks", data.remarks);

      return medicalRecordApi.uploadLabReport(recordId, testId, formData);
    },
    onSuccess: () => {
      toast.success("Lab report uploaded successfully!");
      router.push("/lab/pending");
    },
    onError: (error: any) => {
      toast.error(
        error.message ||
          error.response?.data?.message ||
          "Failed to upload report"
      );
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Only PDF, JPEG, and PNG files are allowed");
        return;
      }
      setFile(selectedFile);
    }
  };

  const onSubmit = (data: UploadFormData) => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    uploadMutation.mutate(data);
  };

  return (
    <div className="container py-8 max-w-2xl">
      <Link
        href="/lab/pending"
        className="text-primary hover:underline inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Pending Tests
      </Link>

      <h1 className="text-3xl font-bold mb-8">Upload Lab Report</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Report Details
          </CardTitle>
          <CardDescription>
            Upload the lab report file and enter the test results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="testName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Name *</FormLabel>
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

              <div>
                <FormLabel>Report File *</FormLabel>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {file ? (
                        <>
                          <File className="w-8 h-8 mb-2 text-primary" />
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF, JPEG, or PNG (Max 5MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              <FormField
                control={form.control}
                name="result"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Result</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Normal, 12.5 g/dL" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="normalRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Normal Range</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 12.0 - 16.0 g/dL" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional comments or observations"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Report
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
