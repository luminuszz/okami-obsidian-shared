import { env } from "@/helpers/env";
import { supabase } from "@/lib/supabase";
import { headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { z } from "zod";

const createNoteSchema = z.object({
	title: z.string(),
	fileContent: z.string(),
	author: z.string().optional(),
});

export async function OPTIONS() {
	return new Response(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, API-Key",
			"Access-Control-Allow-Origin": "*",
		},
	});
}

export async function POST(request: Request) {
	const requestHeaders = await headers();

	const apiKey = requestHeaders.get("API-Key");

	if (!apiKey) {
		return new Response("Unauthorized", { status: 401 });
	}

	const body = await request.json();

	const { fileContent, title } = createNoteSchema.parse(body);

	const fileId = randomUUID();
	const filename = `${fileId}.md`;

	const existsFileInStorage = await supabase
		.from("notes")
		.select("*")
		.eq("title", title);

	if (existsFileInStorage.error) {
		console.log(existsFileInStorage.error);
		return new Response("Error checking if file exists", { status: 500 });
	}

	let publicUrl = "";

	if (existsFileInStorage.data.length > 0) {
		const results = await supabase
			.from("notes")
			.update({ fileId: filename })
			.eq("title", title)
			.select("id")
			.single();

		if (results.error) {
			return new Response("Error updating note", { status: 500 });
		}

		publicUrl = `${env.PUBLIC_HOST}/notes/${results.data.id}`;
	} else {
		const { error: insertError, data: insertData } = await supabase
			.from("notes")
			.insert({
				api_key_id: apiKey,
				title: title,
				fileId: filename,
			})
			.select("id")
			.single();

		if (insertError) {
			return new Response("Error inserting note", { status: 500 });
		}
		publicUrl = `${env.PUBLIC_HOST}/notes/${insertData.id}`;
	}

	const { error } = await supabase.storage
		.from("notes")
		.upload(filename, fileContent, {
			upsert: true,
		});

	if (error) {
		console.log(error);
		return new Response("Error uploading file", { status: 500 });
	}

	return new Response(JSON.stringify({ publicUrl }), {
		headers: {
			"Access-Control-Allow-Origin": "*",
		},
		status: 200,
		statusText: "OK",
	});
}
