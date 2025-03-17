import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogHeader,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";

import React, { useState } from "react";

type Props = {
	issue: {
		summary: string;
		meetingId: string;
		id: string;
		start: string;
		end: string;
		gist: string;
		headline: string;
		createdAt: Date;
	};
};

const IssueCard = ({ issue }: Props) => {
	const [open, setOpen] = useState<boolean>(false);
	return (
		<div>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{issue.gist}</DialogTitle>
						<DialogDescription>
							{issue.createdAt.toLocaleDateString()}
						</DialogDescription>
						<p className="text-gray-600">{issue.headline}</p>
						<blockquote className="mt-2 flex flex-col border-l-4 border-gray-300 bg-gray-50 p-4">
							<span className="text-sm text-gray-600">
								{issue.start}-{issue.end}
							</span>
							<span className="font-medium italic leading-relaxed text-gray-900">
								{issue.summary}
							</span>
						</blockquote>
					</DialogHeader>
				</DialogContent>
			</Dialog>
			<Card className="relative">
				<CardHeader>
					<CardTitle className="text-xl">{issue.gist}</CardTitle>
					<div className="border-b"></div>
					<CardDescription>{issue.headline}</CardDescription>
				</CardHeader>
				<CardContent>
					<Button onClick={() => setOpen(true)}>Details</Button>
				</CardContent>
			</Card>
		</div>
	);
};

export default IssueCard;
