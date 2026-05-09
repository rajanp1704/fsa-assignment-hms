import type { Request, Response } from "express";
import {
  MedicalRecord,
  Appointment,
  Doctor,
  Patient,
  LabReport,
} from "../models/index.js";
import { sendSuccess, sendError, sendPaginated } from "../utils/response.js";
import { Types } from "mongoose";
import { IDoctorDocument } from "../models/Doctor.js";
import { IPatientDocument } from "../models/Patient.js";

export const createMedicalRecord = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, "Not authenticated", 401);
    }

    const data = req.body;

    const appointment = await Appointment.findById(
      data.appointmentId
    ).populate<{ patientId: IPatientDocument; doctorId: IDoctorDocument }>(
      "patientId doctorId"
    );

    if (!appointment) {
      return sendError(res, "Appointment not found", 404);
    }

    const doctor = await Doctor.findOne({ userId: new Types.ObjectId(userId) });
    if (
      !doctor ||
      doctor._id.toString() !== appointment.doctorId._id.toString()
    ) {
      return sendError(
        res,
        "Not authorized to create medical record for this appointment",
        403
      );
    }

    const existingRecord = await MedicalRecord.findOne({
      appointmentId: data.appointmentId,
    });
    if (existingRecord) {
      return sendError(
        res,
        "Medical record already exists for this appointment",
        400
      );
    }

    const record = await MedicalRecord.create({
      appointmentId: new Types.ObjectId(data.appointmentId),
      patientId: appointment.patientId._id,
      doctorId: doctor._id,
      symptoms: data.symptoms,
      diagnosis: data.diagnosis,
      notes: data.notes,
      prescriptions: data.prescriptions || [],
      labTestsRequested:
        data.labTestsRequested?.map((t: { testName: string }) => ({
          testName: t.testName,
          status: "requested",
          requestedAt: new Date(),
        })) || [],
      vitalSigns: data.vitalSigns,
      followUpDate: data.followUpDate,
    });

    appointment.status = "completed";
    await appointment.save();

    return sendSuccess(res, "Medical record created successfully", record, 201);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create medical record";
    return sendError(res, message, 500);
  }
};

export const getMedicalRecordByAppointment = async (
  req: Request,
  res: Response
) => {
  try {
    const { appointmentId } = req.params;
    const record = await MedicalRecord.findOne({
      appointmentId: new Types.ObjectId(appointmentId),
    })
      .populate("patientId", "name age gender")
      .populate("doctorId", "name specialization");

    if (!record) {
      return sendError(res, "Medical record not found", 404);
    }

    return sendSuccess(res, "Medical record retrieved successfully", record);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to retrieve medical record";
    return sendError(res, message, 500);
  }
};

export const getMyMedicalRecords = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, "Not authenticated", 401);
    }

    const patient = await Patient.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!patient) {
      return sendError(res, "Patient profile not found", 404);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      MedicalRecord.find({ patientId: patient._id })
        .populate("doctorId", "name specialization")
        .populate("appointmentId", "date tokenNumber")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      MedicalRecord.countDocuments({ patientId: patient._id }),
    ]);

    return sendPaginated(
      res,
      "Medical records retrieved successfully",
      records,
      {
        page,
        limit,
        total,
      }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to retrieve medical records";
    return sendError(res, message, 500);
  }
};

export const updateMedicalRecord = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, "Not authenticated", 401);
    }

    const { id } = req.params;
    const data = req.body;

    const doctor = await Doctor.findOne({ userId: new Types.ObjectId(userId) });
    const record = await MedicalRecord.findOne({
      _id: id,
      doctorId: doctor?._id,
    });

    if (!record) {
      return sendError(res, "Medical record not found or not authorized", 404);
    }

    Object.assign(record, data);
    await record.save();

    return sendSuccess(res, "Medical record updated successfully", record);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update medical record";
    return sendError(res, message, 500);
  }
};

export const getPendingLabTests = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    const records = await MedicalRecord.aggregate([
      { $unwind: "$labTestsRequested" },
      { $match: { "labTestsRequested.status": { $ne: "completed" } } },
      {
        $lookup: {
          from: "patients",
          localField: "patientId",
          foreignField: "_id",
          as: "patient",
        },
      },
      { $unwind: "$patient" },
      {
        $lookup: {
          from: "doctors",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
      {
        $project: {
          _id: 1,
          appointmentId: 1,
          patientId: 1,
          patientName: "$patient.name",
          doctorName: "$doctor.name",
          labTest: "$labTestsRequested",
          createdAt: 1,
        },
      },
      { $sort: { "labTest.requestedAt": 1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalAgg = await MedicalRecord.aggregate([
      { $unwind: "$labTestsRequested" },
      { $match: { "labTestsRequested.status": { $ne: "completed" } } },
      { $count: "total" },
    ]);

    const total = totalAgg[0]?.total || 0;

    return sendPaginated(
      res,
      "Pending lab tests retrieved successfully",
      records,
      {
        page,
        limit,
        total,
      }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to retrieve pending lab tests";
    return sendError(res, message, 500);
  }
};

export const updateLabTestStatus = async (req: Request, res: Response) => {
  try {
    const { recordId, testId } = req.params;
    const { status } = req.body;

    const record = await MedicalRecord.findOneAndUpdate(
      {
        _id: recordId,
        "labTestsRequested._id": testId,
      },
      {
        $set: {
          "labTestsRequested.$.status": status,
          ...(status === "completed" && {
            "labTestsRequested.$.completedAt": new Date(),
          }),
        },
      },
      { new: true }
    );

    if (!record) {
      return sendError(res, "Medical record or lab test not found", 404);
    }

    return sendSuccess(res, "Lab test status updated successfully", record);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update lab test status";
    return sendError(res, message, 500);
  }
};

export const uploadLabReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, "Not authenticated", 401);
    }

    const { recordId, testId } = req.params;
    const file = req.file;

    if (!file) {
      return sendError(res, "Report file is required", 400);
    }

    const data = req.body;

    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return sendError(res, "Medical record not found", 404);
    }

    const labTest = record.labTestsRequested.find(
      (t) => t._id!.toString() === testId
    );
    if (!labTest) {
      return sendError(res, "Lab test not found", 404);
    }

    const report = await LabReport.create({
      appointmentId: record.appointmentId,
      patientId: record.patientId,
      medicalRecordId: record._id,
      testName: data.testName,
      reportFile: file.path,
      result: data.result,
      normalRange: data.normalRange,
      remarks: data.remarks,
      uploadedBy: new Types.ObjectId(userId),
    });

    await MedicalRecord.findOneAndUpdate(
      {
        _id: recordId,
        "labTestsRequested._id": testId,
      },
      {
        $set: {
          "labTestsRequested.$.status": "completed",
          "labTestsRequested.$.completedAt": new Date(),
        },
      }
    );

    return sendSuccess(res, "Lab report uploaded successfully", report, 201);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to upload lab report";
    return sendError(res, message, 500);
  }
};

export const getMyLabReports = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, "Not authenticated", 401);
    }

    const patient = await Patient.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!patient) {
      return sendError(res, "Patient profile not found", 404);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      LabReport.find({ patientId: patient._id })
        .populate("uploadedBy", "email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      LabReport.countDocuments({ patientId: patient._id }),
    ]);

    return sendPaginated(res, "Lab reports retrieved successfully", reports, {
      page,
      limit,
      total,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve lab reports";
    return sendError(res, message, 500);
  }
};
