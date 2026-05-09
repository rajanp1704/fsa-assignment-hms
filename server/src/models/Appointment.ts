import mongoose, { Schema, Document } from "mongoose";
import { IAppointment } from "../types/index.js";

export interface IAppointmentDocument extends IAppointment, Document {}

const appointmentSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    slot: {
      type: String,
      required: true,
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    symptoms: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

appointmentSchema.pre<IAppointmentDocument>("validate", async function (next) {
  if (this.isNew) {
    const startOfDay = new Date(this.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(this.date);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await mongoose.model("Appointment").countDocuments({
      doctorId: this.doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    this.tokenNumber = count + 1;
  }
  next();
});

export const Appointment = mongoose.model<IAppointmentDocument>(
  "Appointment",
  appointmentSchema
);
