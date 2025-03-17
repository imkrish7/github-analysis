"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { upload } from "@/lib/firebase";
import { Presentation, Upload } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { api } from "@/trpc/react";
import useProject from "@/hooks/use-project";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabaseUpload } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const MeetingCard = () => {
	const uploadMeeting = api.project.uploadMeeting.useMutation();
	const processMeeting = useMutation({
		mutationFn: async (data: { meetingUrl: string; meetingId: string }) => {
			const { meetingUrl, meetingId } = data;
			const response = await axios.post("/api/process-meetings", {
				meetingId,
				meetingUrl,
			});
			return response.data;
		},
	});
	const router = useRouter();
	const { project } = useProject();
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgressed] = useState(0);
	const { getRootProps, getInputProps } = useDropzone({
		accept: {
			"audio.*": [".mp3", ".wav", ".m4a"],
		},
		multiple: false,
		maxSize: 65_000_000,
		onDrop: async (accedpedFile) => {
			setIsUploading(true);
			console.log(accedpedFile);
			const file = accedpedFile[0];
			if (!file) return;
			// const downloadUrl = (await upload(
			// 	file as File,
			// 	setProgressed,
			// )) as string;
			const uploadResponse = (await supabaseUpload(
				file as File,
				project?.id!,
				setProgressed,
			)) as string;
			// console.log(uploadResponse);
			uploadMeeting.mutate(
				{
					projectId: project?.id!,
					meetingUrl: uploadResponse,
					name: file.name,
				},
				{
					onSuccess: (meeting) => {
						toast.success("Meeting is created");
						router.push("/meetings");
						processMeeting.mutateAsync({
							meetingUrl: uploadResponse,
							meetingId: meeting.id,
						});
					},
					onError: () => {
						toast.error("Failed to create meeting");
					},
				},
			);
			setIsUploading(false);
		},
	});
	return (
		<Card
			className="col-span-2 flex flex-col items-center justify-center p-10"
			{...getRootProps()}
		>
			{/* <CardContent> */}
			{!isUploading && (
				<>
					<Presentation className="h-10 w-10 animate-bounce" />
					<h3 className="mt-2 text-sm font-semibold text-gray-500">
						Create a new meeting
					</h3>
					<p className="mt-1 text-center text-sm text-gray-500">
						Analys your meeting with Analysis
						<br />
						Powered by AI
					</p>
					<div className="mt-6">
						<Button disabled={isUploading}>
							<Upload
								className="-ml-0.5 mr-1.5 h-5 w-5"
								aria-hidden={true}
							/>
							Upload Meeting
							<input className="hidden" {...getInputProps()} />
						</Button>
					</div>
				</>
			)}
			{isUploading && (
				<div className="flex flex-col items-center justify-center">
					<CircularProgressbar
						value={progress}
						text={`${progress}%`}
						className="size-20"
						styles={buildStyles({
							pathColor: "#2563eb",
							textColor: "#2563eb",
						})}
					/>
					<p className="text-center text-sm text-gray-500">
						Uploading your meeting...
					</p>
				</div>
			)}
			{/* </CardContent> */}
		</Card>
	);
};

export default MeetingCard;
