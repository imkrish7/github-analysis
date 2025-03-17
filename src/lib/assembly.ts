import { AssemblyAI } from "assemblyai";
const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });

function msToTime(ms: number) {
	const second = ms / 1000;
	const minutes = Math.floor(second / 60);
	const remainingSecond = second % 60;
	return `${minutes.toString().padStart(2, "0")}:${remainingSecond.toString().padStart(2, "0")}`;
}

export const processMeetings = async (meetingurl: string) => {
	const transcript = await client.transcripts.transcribe({
		audio: meetingurl,
		auto_chapters: true,
		language_code: "en",
	});

	const summaries =
		transcript.chapters?.map((chapter) => {
			return {
				start: msToTime(chapter.start),
				end: msToTime(chapter.end),
				gist: chapter.gist,
				summary: chapter.summary,
				headline: chapter.headline,
			};
		}) || [];
	if (!transcript.text) throw new Error("No transcript found");

	return {
		summaries,
	};
};

// let testURL = "https://assembly.ai/news.mp4";

// console.log(await processMeetings(testURL));
