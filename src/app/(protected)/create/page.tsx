"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormInput = {
	repoUrl: string;
	projectName: string;
	githubToken?: string;
};

const Create = () => {
	const { register, handleSubmit, reset } = useForm<FormInput>();
	const createProject = api.project.createProject.useMutation();
	const checkCredit = api.project.checkCredits.useMutation();
	const refetch = useRefetch();

	const onSubmit = (data: FormInput) => {
		if (!!checkCredit.data) {
			createProject.mutate(
				{
					name: data.projectName,
					githubUrl: data.repoUrl,
					githubToken: data.githubToken,
				},
				{
					onSuccess: () => {
						toast.success("Projected created successfully");
						reset();
						refetch();
					},
					onError: () => {
						toast.error("Failed to create project");
					},
				},
			);
		} else {
			checkCredit.mutate({
				githubUrl: data.repoUrl,
				githubToken: data.githubToken,
			});
		}
	};

	const hasEnoughCrdits = checkCredit.data?.userCredits
		? checkCredit.data.userCredits <= checkCredit.data.filesCount
		: true;

	return (
		<div className="flex h-full items-center justify-center gap-12">
			<img src="/undraw_github.svg" className="h-56 w-auto" />
			<div>
				<div>
					<h1 className="text-2xl font-semibold">
						Link you github repository
					</h1>
					<p className="text-sm text-muted-foreground">
						Enter the URL of your respositry to link it to dinsys
					</p>
					<div className="h-4"></div>
					<div>
						<form onSubmit={handleSubmit(onSubmit)}>
							<Input
								placeholder="Project name"
								{...register("projectName", { required: true })}
								required
							/>
							<div className="h-2"></div>
							<Input
								placeholder="Repo url"
								{...register("repoUrl", { required: true })}
								required
							/>
							<div className="h-2"></div>
							<Input
								placeholder="Github token"
								{...register("githubToken")}
							/>
							{!!checkCredit.data && (
								<>
									<div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700">
										<div className="flex items-center gap-2">
											<Info className="h-8 w-8" />
											<p className="text-sm">
												{" "}
												You will be charged{" "}
												<strong>
													{
														checkCredit.data
															.filesCount
													}
												</strong>{" "}
												credits for this respoistory
											</p>
											<p className="text-sm">
												You have{" "}
												<strong>
													{
														checkCredit.data
															.userCredits
													}
												</strong>{" "}
												credits remaining.
											</p>
										</div>
									</div>
								</>
							)}
							<div className="h-4"></div>
							<Button
								type="submit"
								disabled={
									createProject.isPending ||
									checkCredit.isPending ||
									!hasEnoughCrdits
								}
							>
								{!!checkCredit.data
									? "Create Project"
									: "Check Credit"}
							</Button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Create;
