import mongoose from "mongoose";

/**
 * Function to connect to the MongoDB database using Mongoose
 * Ensures a single connection instance is used throughout the application
 */
export async function dbConnect() {
	try {
		if (mongoose.connections && mongoose.connections[0].readyState) {
			console.log("Already connected to database");
			return;
		}

		const { connection } = await mongoose.connect(process.env.ATLAS_DB_URL!, {
			dbName: "Social-Media",
		});

		console.log("Connected to database successfully", connection.host);
	} catch (error: unknown) {
		console.log("Database connection failed", error);

		process.exit(1);
	}
}
