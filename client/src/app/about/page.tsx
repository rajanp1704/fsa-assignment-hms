"use client";

import { Users, Heart, Award, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-16 py-12">
      {/* Hero Section */}
      <section className="container text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
          About{" "}
          <span className="text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            MediCare
          </span>
        </h1>
        <p className="max-w-[700px] mx-auto text-muted-foreground text-lg">
          Dedicated to providing compassionate, world-class healthcare with
          state-of-the-art technology and expert clinical expertise.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="bg-muted/50 py-16">
        <div className="container grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="text-muted-foreground">
              To improve the health and well-being of the communities we serve
              by providing accessible, high-quality medical care through
              innovation, empathy, and excellence in clinical practice.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Our Vision</h2>
            <p className="text-muted-foreground">
              To be the most trusted healthcare provider, recognized for our
              commitment to patient-centered care, pioneering medical research,
              and transformative health outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="container space-y-12">
        <h2 className="text-3xl font-bold text-center">Our Core Values</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow ">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto text-blue-600">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="font-bold">Compassion</h3>
              <p className="text-sm text-muted-foreground">
                We treat every patient with kindness, respect, and deep
                understanding.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow ">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto text-green-600">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-bold">Excellence</h3>
              <p className="text-sm text-muted-foreground">
                We strive for the highest standards in everything we do,
                constantly improving.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow ">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto text-purple-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold">Integrity</h3>
              <p className="text-sm text-muted-foreground">
                We uphold the highest ethical standards and maintain complete
                transparency.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow ">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto text-orange-600">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-bold">Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                We work together across disciplines to provide integrated
                patient care.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
