"use server";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "@/lib/agent";
import { db } from "@/server/db";

const google = createGoogleGenerativeAI({
	apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
	const stream = createStreamableValue();
	const queryVector = await generateEmbedding(question);
	const vectorQuery = `[${queryVector.join(",")}]`;
	const result = (await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
    1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1-("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
        LIMIT 10
    `) as { fileName: string; sourceCode: string; smmary: string }[];
	let context = "";

	for (const doc of result) {
		context += `source ${doc.fileName}\ncode content: ${doc.sourceCode}\nsummary: ${doc.smmary}`;
	}

	(async () => {
		const { textStream } = await streamText({
			model: google("gemini-1.5-flash"),
			prompt: `
            You are an ai assistant who answer questions about the codebase. Your target audience is technical intern
        AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI will answer all questions in the HTML format. including code snippets, proper HTML formatting
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      If the question is asking about code or a specific file, AI will provide the detailed answer, giving step by step instructions, including code snippets.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      START QUESTION BLOCK
      ${question}
      END OF QUESTION BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
            `,
		});
		for await (const delta of textStream) {
			stream.update(delta);
		}
		stream.done();
	})();

	return {
		output: stream.value,
		filesRefrence: result,
	};
}
