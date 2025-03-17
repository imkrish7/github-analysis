import { Button } from "@/components/ui/button";
import MDEditor from "@uiw/react-md-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogHeader,
	DialogContent,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import { BotIcon } from "lucide-react";
import React, { FormEvent, FormEventHandler, useState } from "react";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import CodeReferences from "./code-references";
import { api } from "@/trpc/react";
import { toast } from "sonner";

const AskQuestionCard = () => {
	const saveAnswer = api.project.saveAnswer.useMutation();
	const { project } = useProject();
	const [question, setQuestion] = useState<string>("");
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [filesRefrences, setFilesReferences] = useState<
		{ fileName: string; sourceCode: string; smmary: string }[]
	>([]);
	const [answer, setAnswer] = useState("");
	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!project?.id) return;
		setLoading(true);

		const { output, filesRefrence: references } = await askQuestion(
			question,
			project.id,
		);
		setIsDialogOpen(true);
		setFilesReferences([...references]);
		for await (const delta of readStreamableValue(output)) {
			if (delta) {
				setAnswer((ans) => ans + delta);
			}
		}
		setLoading(false);
	};
	return (
		<>
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="flex justify-center sm:max-w-[80vw]">
					<DialogHeader>
						<div className="flex items-center gap-2">
							<DialogTitle>
								<BotIcon className="h-8 w-8" />
							</DialogTitle>
							<Button
								variant={"outline"}
								disabled={saveAnswer.isPending}
								onClick={() => {
									saveAnswer.mutate(
										{
											projectId: project!.id,
											question,
											answer,
											fileReferences: filesRefrences,
										},
										{
											onSuccess: () => {
												toast.success(
													"Question and Answer is saved",
												);
											},
											onError: () => {
												toast.error(
													"Failed to save question",
												);
											},
										},
									);
								}}
							>
								Save Answer
							</Button>
						</div>
						<MDEditor.Markdown
							source={answer}
							className="!h-full max-h-[35vh] max-w-[70vw] overflow-scroll"
						/>
						<div className="h-4"></div>
						<CodeReferences filesRefrences={filesRefrences} />
						<div className="h-2"></div>
						<Button
							type="button"
							onClick={() => {
								setIsDialogOpen(false);
								setAnswer("");
							}}
							className="inline-flex"
						>
							Reset
						</Button>
					</DialogHeader>
				</DialogContent>
			</Dialog>
			<Card className="relative col-span-4">
				<CardHeader>
					<CardTitle>Ask Question</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<Textarea
							placeholder="Which file should I edit to change the home page?"
							value={question}
							onChange={(event) =>
								setQuestion(event.target.value)
							}
						/>
						<div className="h-4"></div>
						<Button type="submit" disabled={loading}>
							Ask dinsys
						</Button>
					</form>
				</CardContent>
			</Card>
		</>
	);
};

export default AskQuestionCard;
