import { supabase } from "@/lib/supabase";
import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";

const createNoteSchema = z.object({
	title: z.string(),
	fileContent: z.string(),
	author: z.string().optional(),
});

export async function POST(request: NextRequest) {
	const requestHeaders = new Headers(request.headers);

	const apiKey = requestHeaders.get("API-Key");

	if (!apiKey) {
		return new Response("Unauthorized", { status: 401 });
	}

	const body = await request.json();

	const { fileContent, title, author } = createNoteSchema.parse(body);

	const fileId = randomUUID();

	const filename = `${fileId}.md`;

	const { data: uploadData, error: insertError } = await supabase
		.from("notes")
		.insert({
			api_key_id: apiKey,
			title: title,
			fileId: filename,
		})
		.returns();

	if (insertError) {
		return new Response("Error inserting note", { status: 500 });
	}

	const { error, data } = await supabase.storage
		.from("notes")
		.upload(filename, fileContent, {
			upsert: true,
		});

	if (error) {
		console.log(error);
		return new Response("Error uploading file", { status: 500 });
	}

	console.log({ data, uploadData });

	return new Response(JSON.stringify(data), { status: 200 });
}
