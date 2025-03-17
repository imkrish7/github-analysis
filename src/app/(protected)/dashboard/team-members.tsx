import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";

const TeamMembers = () => {
	const { projectId } = useProject();
	const { data: members } = api.project.getTeamMembers.useQuery({
		projectId,
	});

	return (
		<div className="flex items-center gap-2">
			{members?.map((member, index) => {
				return (
					<img
						key={index}
						src={member.user.imageUrl!}
						alt={member.user.firstName}
						height={32}
						width={32}
						className="rounded-full"
					/>
				);
			})}
		</div>
	);
};

export default TeamMembers;
