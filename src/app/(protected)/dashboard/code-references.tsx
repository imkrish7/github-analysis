import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import React, { FC, useState } from "react";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

type Props = {
	filesRefrences: { fileName: string; sourceCode: string; smmary: string }[];
};

const CodeReferences: FC<Props> = ({ filesRefrences }) => {
	const [tab, setTab] = useState<string>(filesRefrences[0]!.fileName);
	if (filesRefrences.length == 0) return;
	return (
		<div className="max-w-[70vw]">
			<Tabs value={tab} onValueChange={setTab}>
				<div className="flex items-center gap-2 overflow-scroll rounded-md bg-gray-200 p-1">
					{filesRefrences.map((file) => {
						return (
							<button
								key={file.fileName}
								onClick={() => setTab(file.fileName)}
								className={cn(
									"text-mutated-foreground whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
									{
										"bg-primary text-primary-foreground":
											tab === file.fileName,
									},
								)}
							>
								{file.fileName}
							</button>
						);
					})}
				</div>
				{filesRefrences.map((file) => {
					return (
						<TabsContent
							key={file.fileName}
							value={file.fileName}
							className="max-h-[40vh] max-w-7xl overflow-scroll rounded-md"
						>
							<SyntaxHighlighter
								language="typescript"
								style={lucario}
							>
								{file.sourceCode}
							</SyntaxHighlighter>
						</TabsContent>
					);
				})}
			</Tabs>
		</div>
	);
};

export default CodeReferences;
