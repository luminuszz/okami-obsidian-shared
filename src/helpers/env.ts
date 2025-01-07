import { z } from "zod";

const envSchema = z.object({
	SUPABASE_ANON_KEY: z.string(),
	SUPABASE_SECRET_KEY: z.string(),
	SUPABASE_URL: z.string().url(),
	PUBLIC_HOST: z.string().url(),
});

export const env = envSchema.parse(process.env);
