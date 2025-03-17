import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogHeader,
	DialogContent,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useProject from "@/hooks/use-project";
import React, { useState } from "react";
import { toast } from "sonner";

const InviteButton = () => {
	const { projectId } = useProject();
	const [open, setOpen] = useState<boolean>(false);
	return (
		<>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Invite team members</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-gray-500">
						Ask them to copy and paste this link
					</p>
					<Input
						className="mt-4"
						onClick={() => {
							navigator.clipboard.writeText(
								`${window.location.origin}/join/project/${projectId}`,
							);
							toast.success("Copies to clippborad");
						}}
						readOnly
						value={`${window.location.origin}/join/project/${projectId}`}
					/>
				</DialogContent>
			</Dialog>
			<Button size="sm" onClick={() => setOpen(true)}>
				Invite Members
			</Button>
		</>
	);
};

export default InviteButton;
