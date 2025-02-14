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
	attachments: Array<{ original_file_name: string; publicUrl: string }>;
}

export function MarkdownView({ content }: MarkdownEditorProps) {
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
								// @ts-ignore
								<SyntaxHighlighter
									{...rest}
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

						img: ({ node, ...props }) => (
							<img {...props} className="max-w-full h-auto" alt={props.alt} />
						),
					}}
				>
					{content}
				</Markdown>
			</div>
		</aside>
	);
}
