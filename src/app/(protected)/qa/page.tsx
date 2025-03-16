"use client";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React, { Fragment, useState } from "react";
import AskQuestionCard from "../dashboard/ask-question-card";
import { UsbIcon } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "../dashboard/code-references";

const QA = () => {
	const { projectId } = useProject();
	const { data: questions } = api.project.getQuestions.useQuery({
		projectId,
	});

	const [questionIndex, setQuestionIndex] = useState<number>(0);

	const question = questions?.[questionIndex];

	return (
		<Sheet>
			<AskQuestionCard />
			<div className="h-4"></div>
			<h1 className="text-xl font-semibold">Saved Questions</h1>
			<div className="h-2"></div>
			<div className="flex flex-col gap-2">
				{questions?.map((question, index) => {
					return (
						<Fragment key={question.id}>
							<SheetTrigger
								onClick={() => {
									setQuestionIndex(index);
								}}
							>
								<div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow">
									{question.user.imageUrl ? (
										<img
											src={question.user.imageUrl}
											height={30}
											width={30}
											className="rounded-full"
										/>
									) : (
										<UsbIcon className="h-4 w-4" />
									)}
									<div className="flex flex-col text-left">
										<div className="flex items-center gap-2">
											<p className="line-clamp-1 text-lg font-medium text-gray-900">
												{question.question}
											</p>
											<span className="whitespace-nowrap text-sm text-gray-400">
												{question.createdAt.toLocaleDateString()}
											</span>
										</div>
										<p className="line-clamp-1 text-sm text-gray-500">
											{question.answer}
										</p>
									</div>
								</div>
							</SheetTrigger>
						</Fragment>
					);
				})}
			</div>
			{question && (
				<SheetContent className="sm:max-w-[80vw]">
					<SheetHeader>
						<SheetTitle>{question.question}</SheetTitle>
						<MDEditor.Markdown source={question.answer} />
						<CodeReferences
							filesRefrences={
								(question.filesReferences ?? []) as any
							}
						/>
					</SheetHeader>
				</SheetContent>
			)}
		</Sheet>
	);
};

export default QA;
