"use client";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";
import MeetingCard from "../dashboard/meeting-card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

const Meetings = () => {
	const { projectId } = useProject();
	const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
		{
			projectId: projectId,
		},
		{
			refetchInterval: 4000,
		},
	);
	const deleteMeeting = api.project.deleteMeeting.useMutation();
	const refetch = useRefetch();
	return (
		<>
			<MeetingCard />
			<div className="h-6"></div>
			<h1 className="text-xl font-semibold">Meetings</h1>
			{meetings && meetings.length === 0 && <div>No meetings found</div>}
			{isLoading && <div>Loading...</div>}
			<ul className={"divide divide-gray-200"}>
				{meetings?.map((meeting, index) => {
					return (
						<li
							key={index}
							className="flex items-center justify-between gap-x-6 py-5"
						>
							<div>
								<div className="min-w-0">
									<div className="flex items-center gap-2">
										<Link
											href={`/meetings/${meeting.id}`}
											className="text-sm font-semibold"
										>
											{meeting.name}
										</Link>
										{meeting.status === "PROCESSING" && (
											<Badge
												color="warning"
												className="bg-yellow-500 text-white"
											>
												Processing...
											</Badge>
										)}
										{meeting.status === "COMPLETED" && (
											<Badge
												color="warning"
												className="bg-green-500 text-white"
											>
												Completed
											</Badge>
										)}
									</div>
									<div className="flex items-center gap-x-2 text-xs text-gray-500">
										<p className="whitespace-nowrap">
											{meeting.createdAt.toLocaleDateString()}
										</p>
										<p className="trucate">
											{meeting.issues.length}
										</p>
									</div>
								</div>
							</div>
							<div className="flex flex-none items-center gap-x-4">
								<Link href={`/meetings/${meeting.id}`}>
									<Button variant={"outline"}>View</Button>
								</Link>
								<Button
									disabled={deleteMeeting.isPending}
									onClick={() => {
										deleteMeeting.mutate(
											{
												meetingId: meeting.id,
											},
											{
												onSuccess: () => {
													toast.success(
														"Meeting has been deleted",
													);
													refetch();
												},
											},
										);
									}}
									variant={"destructive"}
								>
									Delete
								</Button>
							</div>
						</li>
					);
				})}
			</ul>
		</>
	);
};

export default Meetings;
