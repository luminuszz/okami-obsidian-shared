"use client";

import Markdown from "react-markdown";

import remarkGfm from "remark-gfm";
import remarkImages from "remark-images";

// @ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

// @ts-ignore
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export interface MarkdownEditorProps {
	content: string;
}

export function MarkdownView({ content }: MarkdownEditorProps) {
	console.log({ content });

	return (
		<aside className="flex items-center w-full h-full justify-center">
			<div className="bg-muted max-w-[600px] w-full h-[600px]  pb-4  gap-4r">
				<Markdown
					className="max-w-[600px] w-full max-h-[600px] h-full pb-4 markdownEditor decoration-inherit list-disc"
					remarkPlugins={[remarkGfm, remarkImages]}
					components={{
						code(props) {
							const { children, className, node, ...rest } = props;
							const match = /language-(\w+)/.exec(className || "");
							return match ? (
								<SyntaxHighlighter
									{...rest}
									PreTag="div"
									// biome-ignore lint/correctness/noChildrenProp: <explanation>
									children={String(children).replace(/\n$/, "")}
									language={match[1]}
									style={dracula}
								/>
							) : (
								<code {...rest} className={className}>
									{children}
								</code>
							);
						},
					}}
				>
					{content}
				</Markdown>
			</div>
		</aside>
	);
}
