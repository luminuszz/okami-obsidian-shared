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

	return <h1>teste {id}</h1>;
}
