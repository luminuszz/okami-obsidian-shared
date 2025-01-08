import { MarkdownView } from "@/components/markdpwn-view";
import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";

type PageProps = {
	params: Promise<{ id: string }>;
};

export async function generateMetadata(params: PageProps): Promise<Metadata> {
	const { id } = await params.params;

	const results = await supabase
		.from("notes")
		.select(`title,
			api_keys (
				author
			)
			`)
		.eq("id", id)
		.single();

	if (results.error) {
		return {
			title: "Obsidian Note shared",
			description: "Shared layout for all pages",
		};
	}

	const { title, api_keys } = results.data;

	const pageTitle = api_keys?.author ? `${title} - ${api_keys?.author}` : title;

	return {
		title: pageTitle,
		description: "Shared layout for all pages",
	};
}

export default async function NotePage({ params }: PageProps) {
	const { id } = await params;

	const results = await supabase
		.from("notes")
		.select(`
				fileId, title,
				note_attachments (
					fileId,
					original_file_name
				),
				api_keys (
				author
			)
			`)
		.eq("id", id)
		.single();

	if (results.error) {
		return <h1>Erro</h1>;
	}

	const { fileId, title, note_attachments, api_keys } = results.data;

	const fileResponse = await supabase.storage.from("notes").download(fileId);

	const attachments = note_attachments.map((attachment) => {
		const { data } = supabase.storage
			.from("notes")
			.getPublicUrl(attachment.fileId, {
				download: false,
			});

		return {
			...attachment,
			publicUrl: data.publicUrl,
		};
	});

	if (fileResponse.error) {
		console.log(fileResponse.error);
		return <h1>Erro</h1>;
	}

	const fileContent = await fileResponse.data.text();

	const attachmentRegex = /!\[\[([^\]]+)\]\]|!\[.*?\]\((.*?)\)/g;

	const replacedContent = fileContent.replace(
		attachmentRegex,
		(match, p1, p2) => {
			const fileName = p1 || p2;
			const attachment = attachments.find(
				(att) => att.original_file_name === fileName,
			);
			if (attachment) {
				return `![${fileName}](${attachment.publicUrl})`;
			}
			return match;
		},
	);

	return (
		<main className="flex container mx-auto flex-col items-center gap-4">
			<h1>{title}</h1>
			{api_keys?.author && <p>Author: {api_keys?.author}</p>}

			<MarkdownView content={replacedContent} attachments={attachments} />
		</main>
	);
}
