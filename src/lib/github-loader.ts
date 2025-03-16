import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { summarizeCode, generateEmbedding } from "./agent";
import { db } from "@/server/db";
// import { db } from "@/server/db";

export const loadGithubRepo = async (
	githubUrl: string,
	githubToken?: string,
) => {
	const loader = new GithubRepoLoader(githubUrl, {
		accessToken: githubToken || "",
		branch: "main",
		ignoreFiles: [
			"package-lock.json",
			"yarn.lock",
			"pnpm-lock.yml",
			"bun.lockb",
		],
		recursive: true,
		unknown: "warn",
		maxConcurrency: 5,
	});

	const docs = await loader.load();
	return docs;
};

// console.log(await loadGithub("https://github.com/docker/genai-stack"));

export const indexGithubRepo = async (
	projectId: string,
	githubUrl: string,
	githubToken?: string,
) => {
	const docs = await loadGithubRepo(githubUrl, githubToken);
	const allEmbedding = await generateEmbeddings(docs);
	await Promise.allSettled(
		allEmbedding.map(async (embedding, index) => {
			if (!embedding) return;
			const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
				data: {
					summary: embedding.summary,
					sourceCode: embedding.souceCode,
					fileName: embedding.fileName,
					projectId,
				},
			});
			await db.$executeRaw`
            UPDATE "SourceCodeEmbedding"
            SET "summaryEmbedding" = ${embedding.embedding}::vector
            WHERE "id" = ${sourceCodeEmbedding.id}
            `;
		}),
	);
};

export const generateEmbeddings = async (docs: Document[]) => {
	return await Promise.all(
		docs.map(async (doc) => {
			const summary = await summarizeCode(doc);
			const embedding = await generateEmbedding(summary);
			return {
				summary,
				embedding,
				souceCode: JSON.parse(JSON.stringify(doc.pageContent)),
				fileName: doc.metadata.source,
			};
		}),
	);
};
