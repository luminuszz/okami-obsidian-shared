import type { Database } from "@/@types/supabase";
import { env } from "@/helpers/env";

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient<Database>(
	env.SUPABASE_URL,
	env.SUPABASE_ANON_KEY,
);
