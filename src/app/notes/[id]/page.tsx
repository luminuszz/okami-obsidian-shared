import { MarkdownView } from "@/components/markdpwn-view";
import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Obsidian Note shared",
	description: "Shared layout for all pages",
};

type PageProps = {
	params: Promise<{ id: string }>;
};

export default async function NotePage({ params }: PageProps) {
	const { id } = await params;

	const results = await supabase
		.from("notes")
		.select("*")
		.eq("id", id)
		.single();

	if (results.error) {
		return <h1>Erro</h1>;
	}

	const { fileId, title } = results.data;

	console.log({ fileId });

	const fileResponse = await supabase.storage.from("notes").download(fileId);

	if (fileResponse.error) {
		console.log(fileResponse.error);
		return <h1>Erro</h1>;
	}

	const fileContent = await fileResponse.data.text();

	return (
		<main className="flex container mx-auto flex-col items-center gap-4">
			<h1>{title}</h1>

			<MarkdownView content={fileContent} />
		</main>
	);
}
