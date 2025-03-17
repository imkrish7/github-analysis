import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import React from "react";
import { toast } from "sonner";

const ArchiveButton = () => {
	const archiveProject = api.project.archievProject.useMutation();
	const { projectId } = useProject();
	const refetch = useRefetch();
	return (
		<Button
			disabled={archiveProject.isPending}
			variant={"destructive"}
			size={"sm"}
			onClick={() => {
				const confirm = window.confirm(
					"Are you sure you want to archive the project?",
				);
				if (confirm) {
					archiveProject.mutate(
						{ projectId: projectId! },
						{
							onSuccess: () => {
								toast.success("Project has been archived");
								refetch();
							},
							onError: () => {
								toast.error("There has been error");
							},
						},
					);
				}
			}}
		>
			Archive
		</Button>
	);
};

export default ArchiveButton;
