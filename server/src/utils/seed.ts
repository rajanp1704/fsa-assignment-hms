import { connectDB, disconnectDB } from "../config/index.js";
import { User, Doctor, Patient } from "../models/index.js";

const seedDatabase = async () => {
  try {
    await connectDB();

    const existingUser = await User.countDocuments();
    const existingDoctor = await Doctor.countDocuments();
    const existingPatient = await Patient.countDocuments();

    if (existingUser + existingDoctor + existingPatient) {
      console.log("\n📔 Data Already Exists");
      console.log("🚨 Database seeding canceled\n");
      return;
    }

    console.log("🌱 Starting database seed...");

    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    console.log("✓ Cleared existing data");

    // Create admin user
    await User.create({
      email: "admin@hospital.com",
      password: "admin123",
      role: "admin",
    });
    console.log("✓ Created admin user: admin@hospital.com / admin123");

    // Create lab staff user
    await User.create({
      email: "lab@hospital.com",
      password: "lab123",
      role: "labstaff",
    });
    console.log("✓ Created lab staff user: lab@hospital.com / lab123");

    // Create doctors
    const doctorData = [
      {
        email: "dr.sharma@hospital.com",
        password: "doctor123",
        name: "Dr. Rajesh Sharma",
        specialization: "General Medicine",
        qualification: "MBBS, MD",
        experience: 15,
        phone: "9876543210",
        consultationFee: 500,
        opdTimings: [
          {
            day: "monday",
            startTime: "09:00",
            endTime: "13:00",
            maxPatients: 20,
          },
          {
            day: "tuesday",
            startTime: "09:00",
            endTime: "13:00",
            maxPatients: 20,
          },
          {
            day: "wednesday",
            startTime: "09:00",
            endTime: "13:00",
            maxPatients: 20,
          },
          {
            day: "thursday",
            startTime: "09:00",
            endTime: "13:00",
            maxPatients: 20,
          },
          {
            day: "friday",
            startTime: "09:00",
            endTime: "13:00",
            maxPatients: 20,
          },
          {
            day: "saturday",
            startTime: "09:00",
            endTime: "12:00",
            maxPatients: 15,
          },
        ],
      },
      {
        email: "dr.patel@hospital.com",
        password: "doctor123",
        name: "Dr. Priya Patel",
        specialization: "Cardiology",
        qualification: "MBBS, DM (Cardiology)",
        experience: 12,
        phone: "9876543211",
        consultationFee: 800,
        opdTimings: [
          {
            day: "monday",
            startTime: "14:00",
            endTime: "18:00",
            maxPatients: 15,
          },
          {
            day: "wednesday",
            startTime: "14:00",
            endTime: "18:00",
            maxPatients: 15,
          },
          {
            day: "friday",
            startTime: "14:00",
            endTime: "18:00",
            maxPatients: 15,
          },
        ],
      },
      {
        email: "dr.kumar@hospital.com",
        password: "doctor123",
        name: "Dr. Amit Kumar",
        specialization: "Orthopedics",
        qualification: "MBBS, MS (Ortho)",
        experience: 10,
        phone: "9876543212",
        consultationFee: 600,
        opdTimings: [
          {
            day: "tuesday",
            startTime: "14:00",
            endTime: "18:00",
            maxPatients: 18,
          },
          {
            day: "thursday",
            startTime: "14:00",
            endTime: "18:00",
            maxPatients: 18,
          },
          {
            day: "saturday",
            startTime: "10:00",
            endTime: "14:00",
            maxPatients: 20,
          },
        ],
      },
    ];

    for (const doc of doctorData) {
      const user = await User.create({
        email: doc.email,
        password: doc.password,
        role: "doctor",
      });

      await Doctor.create({
        userId: user._id,
        name: doc.name,
        specialization: doc.specialization,
        qualification: doc.qualification,
        experience: doc.experience,
        phone: doc.phone,
        email: doc.email,
        opdTimings: doc.opdTimings,
        consultationFee: doc.consultationFee,
        status: "active",
      });

      console.log(`✓ Created doctor: ${doc.email} / doctor123`);
    }

    // Create sample patient
    const patientUser = await User.create({
      email: "patient@example.com",
      password: "patient123",
      role: "patient",
    });

    await Patient.create({
      userId: patientUser._id,
      name: "John Doe",
      age: 35,
      gender: "male",
      phone: "9876543220",
      email: "patient@example.com",
      address: "123 Main Street, Mumbai",
      bloodGroup: "O+",
      medicalHistory: ["Diabetes"],
      allergies: ["Penicillin"],
      emergencyContact: {
        name: "Jane Doe",
        phone: "9876543221",
        relation: "Spouse",
      },
    });
    console.log("✓ Created sample patient: patient@example.com / patient123");

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📋 Test Credentials:");
    console.log("   Admin: admin@hospital.com / admin123");
    console.log("   Lab Staff: lab@hospital.com / lab123");
    console.log("   Doctor: dr.sharma@hospital.com / doctor123");
    console.log("   Doctor: dr.patel@hospital.com / doctor123");
    console.log("   Doctor: dr.kumar@hospital.com / doctor123");
    console.log("   Patient: patient@example.com / patient123");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

seedDatabase();
