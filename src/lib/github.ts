import { Octokit } from "octokit";
import axios from "axios";
import { summarizeCommit } from "./agent";
import { db } from "@/server/db";

export const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN,
});

const githubURL = `https://github.com/docker/genai-stack`;
console.log("GEni", process.env.GEMINI_API_KEY);

type Response = {
	commitMessage: string;
	commitHash: string;
	commitAuthorName: string;
	commitAuthorAvatar: string;
	commitDate: string;
};

export const getCommitHashes = async (url: string): Promise<Response[]> => {
	const [owner, repo] = url.split("/").slice(-2);
	if (!owner || !repo) {
		throw new Error("Url is not valid");
	}
	const { data } = await octokit.rest.repos.listCommits({
		owner,
		repo,
	});

	const sortedCommits = data.sort(
		(a: any, b: any) =>
			new Date(b.commit.author.date).getTime() -
			new Date(a.commit.author.date).getTime(),
	);

	let commits = sortedCommits.slice(0, 10).map((commit: any) => {
		return {
			commitHash: commit.sha as string,
			commitMessage: (commit.commit.message ?? "") as string,
			commitAuthorName: (commit.commit?.author?.name ?? "") as string,
			commitAuthorAvatar: (commit.commit?.author?.avatar_url ??
				"") as string,
			commitDate: (commit.commit?.author?.date ?? "") as string,
		};
	});
	return commits;
};

async function fetchProjectGithubUrl(projectId: string) {
	const project = await db.project.findUnique({
		where: { id: projectId },
		select: {
			githubUrl: true,
		},
	});

	if (!project?.githubUrl) {
		throw new Error("Project has no github url");
	}

	return { project, githubURL: project?.githubUrl };
}

async function filterUnprocessedCommits(
	projectId: string,
	commitHashes: Response[],
) {
	const processedCommits = await db.commit.findMany({
		where: { projectId },
	});

	const unprocessedCommit = commitHashes.filter(
		(commit) =>
			!processedCommits.some(
				(processedCommit) =>
					processedCommit.commitHash === commit.commitHash,
			),
	);
	return unprocessedCommit;
}

async function summarizeCommits(githubUrl: string, commitHash: Response) {
	const { data } = await axios.get(
		`${githubUrl}/commit/${commitHash.commitHash}.diff`,
		{
			headers: {
				Accept: `application/vnd.github.v3.diff`,
			},
		},
	);

	const summary = await summarizeCommit(data);
	return summary;
}

export const pullCommit = async (projectId: string) => {
	const { project, githubURL } = await fetchProjectGithubUrl(projectId);
	const commitHashes = await getCommitHashes(githubURL!);

	const unprocessedCommit = await filterUnprocessedCommits(
		projectId,
		commitHashes,
	);

	const summaryResponse = await Promise.allSettled(
		unprocessedCommit.map((commit) => {
			return summarizeCommits(githubURL, commit);
		}),
	);

	const summarise = summaryResponse.map((response) => {
		console.log(response);
		if (response.status === "fulfilled") {
			return response.value as string;
		}
		return "";
	});
	const commit = await db.commit.createMany({
		data: summarise.map((summary, index) => {
			return {
				projectId: projectId,
				commitHash: unprocessedCommit[index]?.commitHash!,
				commitAuthorAvatar:
					unprocessedCommit[index]?.commitAuthorAvatar!,
				commitAuthorName: unprocessedCommit[index]?.commitAuthorName!,
				commitMessage: unprocessedCommit[index]?.commitMessage!,
				commitDate: unprocessedCommit[index]?.commitDate!,
				summary,
			};
		}),
	});
	return commit;
};
