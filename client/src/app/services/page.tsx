"use client";

import {
  Stethoscope,
  Activity,
  Microscope,
  Brain,
  Baby,
  Bone,
  HeartPulse,
  Syringe,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const services = [
  {
    title: "General Medicine",
    description: "Comprehensive primary healthcare for adults and children.",
    icon: Stethoscope,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    title: "Cardiology",
    description:
      "Expert care for heart-related conditions and cardiovascular health.",
    icon: HeartPulse,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    title: "Pediatrics",
    description:
      "Specialized medical care for infants, children, and adolescents.",
    icon: Baby,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    title: "Neurology",
    description:
      "Advanced diagnosis and treatment for nervous system disorders.",
    icon: Brain,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    title: "Orthopedics",
    description: "Treatment for musculoskeletal injuries and conditions.",
    icon: Bone,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    title: "Lab Services",
    description: "Accurate and timely diagnostic testing and analysis.",
    icon: Microscope,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
  },
  {
    title: "Emergency Care",
    description: "24/7 critical care services for urgent medical needs.",
    icon: Activity,
    color: "text-rose-500",
    bg: "bg-rose-50",
  },
  {
    title: "Vaccination",
    description: "Complete immunization services for all age groups.",
    icon: Syringe,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
];

export default function ServicesPage() {
  return (
    <div className="container py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          Our Medical Services
        </h1>
        <p className="text-muted-foreground text-lg max-w-150 mx-auto">
          We offer a comprehensive range of medical services provided by expert
          healthcare professionals using the latest medical technologies.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, index) => (
          <Card
            key={index}
            className="group hover:border-primary/50 transition-all cursor-default"
          >
            <CardHeader>
              <div
                className={`w-12 h-12 rounded-lg ${service.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <service.icon className={`h-6 w-6 ${service.color}`} />
              </div>
              <CardTitle className="text-xl">{service.title}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center space-y-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-bold">
          Need a specialized consultation?
        </h2>
        <p className="text-muted-foreground max-w-150 mx-auto">
          Our team of specialists is here to help you with personalized
          treatment plans tailored to your specific health needs.
        </p>
        <div className="flex justify-center gap-4"></div>
      </div>
    </div>
  );
}
