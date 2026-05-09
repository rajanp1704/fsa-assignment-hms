import { Stethoscope } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const AppIcon = () => {
  return (
    <div className="flex items-center gap-2">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src={"/logo.svg"}
          alt="app-logo"
          width={500}
          height={500}
          className="h-8 w-8"
        />
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          MediCare
        </span>
      </Link>
    </div>
  );
};

export default AppIcon;
