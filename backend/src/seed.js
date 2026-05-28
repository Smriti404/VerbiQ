import "dotenv/config";
import mongoose from "mongoose";

import { connectDB } from "./lib/db.js";
import User from "./models/User.js";

const demoUsers = [
  {
    fullName: "Ava Lin",
    email: "ava.lin+demo@verbiq.dev",
    password: "demo1234",
    bio: "Fluent in English, learning Spanish. Coffee and travel fan.",
    profilePic: "https://i.pravatar.cc/150?img=32",
    nativeLanguage: "english",
    learningLanguage: "spanish",
    proficiency: "beginner",
    interests: ["Travel", "Food", "Music"],
    timezone: "UTC-05:00",
    availabilityDays: ["Mon", "Wed", "Sat"],
    availabilityTime: "evening",
    location: "Chicago, USA",
    isOnboarded: true,
  },
  {
    fullName: "Diego Ruiz",
    email: "diego.ruiz+demo@verbiq.dev",
    password: "demo1234",
    bio: "Native Spanish speaker, learning English. Loves soccer.",
    profilePic: "https://i.pravatar.cc/150?img=12",
    nativeLanguage: "spanish",
    learningLanguage: "english",
    proficiency: "intermediate",
    interests: ["Sports", "Movies", "Gaming"],
    timezone: "UTC-06:00",
    availabilityDays: ["Tue", "Thu", "Sun"],
    availabilityTime: "afternoon",
    location: "Monterrey, Mexico",
    isOnboarded: true,
  },
  {
    fullName: "Keiko Sato",
    email: "keiko.sato+demo@verbiq.dev",
    password: "demo1234",
    bio: "Native Japanese speaker learning German. Reads sci-fi.",
    profilePic: "https://i.pravatar.cc/150?img=47",
    nativeLanguage: "japanese",
    learningLanguage: "german",
    proficiency: "advanced",
    interests: ["Books", "Tech", "Art"],
    timezone: "UTC+09:00",
    availabilityDays: ["Fri", "Sat", "Sun"],
    availabilityTime: "morning",
    location: "Tokyo, Japan",
    isOnboarded: true,
  },
];

const ensureUser = async (userData) => {
  const existing = await User.findOne({ email: userData.email });
  if (existing) return { status: "exists", email: userData.email };

  await User.create(userData);
  return { status: "created", email: userData.email };
};

const run = async () => {
  try {
    await connectDB();

    const results = [];
    for (const userData of demoUsers) {
      // Create only if missing to avoid clobbering real accounts.
      results.push(await ensureUser(userData));
    }

    const created = results.filter((r) => r.status === "created").length;
    const exists = results.filter((r) => r.status === "exists").length;
    console.log(`Seed complete: ${created} created, ${exists} already existed.`);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
