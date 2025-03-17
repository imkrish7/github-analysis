import { db } from "@/server/db";
import { useAuth } from "@clerk/nextjs";
import { clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
// import { redirect } from "";
import React from "react";

type Props = {
	params: Promise<{ projectId: string }>;
};

const JoinProject = async ({ params }: Props) => {
	const { projectId } = await params;
	const { userId } = await useAuth();
	if (!userId) return redirect("/sign-in");
	const dbUser = await db.user.findUnique({
		where: {
			id: userId!,
		},
	});
	const client = await clerkClient();
	const user = await client.users.getUser(userId);
	if (!dbUser) {
		await db.user.create({
			data: {
				id: userId,
				emailAddress: user.emailAddresses[0]?.emailAddress!,
				imageUrl: user.imageUrl,
				firstName: user.firstName!,
				lastName: user.lastName!,
			},
		});
	}
	const project = await db.project.findUnique({
		where: { id: projectId },
	});
	if (!projectId) return redirect("/dashboard");
	try {
		await db.userToProject.create({
			data: {
				projectId,
				userId,
			},
		});
	} catch (error) {
		console.error(error);
	}
	return redirect(`/dashboard/${projectId}`);
};

export default JoinProject;
