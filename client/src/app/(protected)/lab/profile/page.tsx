import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ArrowLeft, User } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PatientProfilePage() {
  const cookieStore = await cookies();
  const user = cookieStore.get("user");
  if (!user) {
    redirect("/login");
  }
  const userValue = JSON.parse(user.value);

  return (
    <div className="container py-8 ">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/lab/dashboard"
            className="text-primary hover:underline inline-flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            View your personal information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle>{"Lab Professional"}</CardTitle>
              <CardDescription>{userValue?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
