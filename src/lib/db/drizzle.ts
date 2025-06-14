import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

// Schema
import * as AuthSchema from "@/lib/auth/schema";
import * as ChatSchema from "./schema";



const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
export const db = drizzle({
	client: pool,
	schema: { ...AuthSchema, ...ChatSchema },
});