"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="container py-12 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          Contact Us
        </h1>
        <p className="text-muted-foreground text-lg max-w-[800px] mx-auto">
          Have questions or need assistance? Our team is here to help you. Reach
          out to us through any of the following channels.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <Card className="border-none shadow-md ">
          <CardContent className="pt-6 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold">Phone</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Reception: +91 98765 43210
                <br />
                Emergency: +91 98765 01234
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md ">
          <CardContent className="pt-6 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold">Email</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                General: info@medicare.com
                <br />
                Appointments: book@medicare.com
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md ">
          <CardContent className="pt-6 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold">Location</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                123 Healthcare Street,
                <br />
                Mumbai, India 400001
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
