import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecoguardian');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
    // Fixed: Property 'exit' does not exist on type 'Process'.
    // Casting 'process' to 'any' to ensure accessibility to the exit method in this execution context.
    (process as any).exit(1);
  }
};