"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="bg-red-50 p-6 rounded-full inline-block">
        <AlertCircle className="h-16 w-16 text-red-500" />
      </div>

      <div className="space-y-4 max-w-[500px]">
        <h1 className="text-3xl font-bold">Something went wrong!</h1>
        <p className="text-muted-foreground">
          We apologize for the inconvenience. An unexpected error occurred. Our
          team has been notified and we&apos;re working on a fix.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => reset()} size="lg" className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href="/">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
