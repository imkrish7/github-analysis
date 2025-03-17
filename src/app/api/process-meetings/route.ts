import { processMeetings } from "@/lib/assembly";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodyParser = z.object({
	meetingUrl: z.string(),
	meetingId: z.string(),
});

export const maxDuration = 300 / 5;

export async function POST(req: NextRequest) {
	const { userId } = await auth();

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	console.log("---------------meetting transcript----------------");
	try {
		const body = await req.json();
		const { meetingId, meetingUrl } = bodyParser.parse(body);
		const { summaries } = await processMeetings(meetingUrl);
		await db.issue.createMany({
			data: summaries.map((summary) => {
				return {
					start: summary.start,
					end: summary.end,
					headline: summary.headline,
					gist: summary.gist,
					summary: summary.summary,
					meetingId,
				};
			}),
		});

		await db.meeting.update({
			where: { id: meetingId },
			data: {
				status: "COMPLETED",
				name: summaries[0]?.headline,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
