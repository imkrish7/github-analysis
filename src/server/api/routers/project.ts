import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import z from "zod";
import { pullCommit } from "@/lib/github";
import { checkCredits, indexGithubRepo } from "@/lib/github-loader";
import { InputOTPGroup } from "@/components/ui/input-otp";
import { db } from "@/server/db";
import { issue } from "@uiw/react-md-editor";
import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";

export const ProjectRouter = createTRPCRouter({
	createProject: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				githubUrl: z.string(),
				githubToken: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.db.user.findUnique({
				where: { id: ctx.user.userId! },
				select: { credits: true },
			});
			if (!user) {
				throw new Error("User not found");
			}

			const currentCredits = user.credits || 0;
			const filesCount = await checkCredits(
				input.githubUrl,
				input.githubToken,
			);
			if (currentCredits < filesCount) {
				throw new Error("Insufficiant credits");
			}
			try {
				const project = await ctx.db.project.create({
					data: {
						githubUrl: input.githubUrl,
						name: input.name,
						userToProjects: {
							create: {
								userId: ctx.user.userId!,
							},
						},
					},
				});
				await indexGithubRepo(
					project.id,
					input.githubUrl,
					input.githubToken,
				);
				await pullCommit(project.id);
				await ctx.db.user.update({
					where: { id: ctx.user.userId! },
					data: { credits: { decrement: filesCount } },
				});
				return project;
			} catch (error) {
				if (error instanceof Error) {
					console.error(error.message);
				} else {
					console.error("An unknown error occurred");
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
				});
			}
		}),
	getProjects: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.project.findMany({
			where: {
				userToProjects: {
					some: {
						userId: ctx.user.userId!,
					},
				},
				deletedAt: null,
			},
		});
	}),
	getCommits: protectedProcedure
		.input(
			z.object({
				projectId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			return ctx.db.commit.findMany({
				where: {
					projectId: input.projectId,
				},
			});
		}),
	saveAnswer: protectedProcedure
		.input(
			z.object({
				projectId: z.string(),
				question: z.string(),
				fileReferences: z.any(),
				answer: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.question.create({
				data: {
					projectId: input.projectId,
					question: input.question,
					filesReferences: input.fileReferences,
					answer: input.answer,
					userId: ctx.user.userId!,
				},
			});
		}),
	getQuestions: protectedProcedure
		.input(
			z.object({
				projectId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			return await ctx.db.question.findMany({
				where: {
					projectId: input.projectId,
				},
				include: {
					user: true,
				},
				orderBy: {
					createdAt: "desc",
				},
			});
		}),
	uploadMeeting: protectedProcedure
		.input(
			z.object({
				projectId: z.string(),
				meetingUrl: z.string(),
				name: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const meeting = await ctx.db.meeting.create({
				data: {
					projectId: input.projectId,
					name: input.name,
					meetingUrl: input.meetingUrl,
					status: "PROCESSING",
				},
			});
			return meeting;
		}),
	getMeetings: protectedProcedure
		.input(
			z.object({
				projectId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			return await ctx.db.meeting.findMany({
				where: { projectId: input.projectId },
				include: {
					issues: true,
				},
			});
		}),
	deleteMeeting: protectedProcedure
		.input(z.object({ meetingId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.meeting.delete({
				where: { id: input.meetingId },
			});
		}),
	getMeetingById: protectedProcedure
		.input(
			z.object({
				meetingId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			return await ctx.db.meeting.findUnique({
				where: { id: input.meetingId },
				include: {
					issues: true,
				},
			});
		}),
	archievProject: protectedProcedure
		.input(
			z.object({
				projectId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.project.update({
				where: { id: input.projectId },
				data: {
					deletedAt: new Date(),
				},
			});
		}),
	getTeamMembers: protectedProcedure
		.input(
			z.object({
				projectId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			return await ctx.db.userToProject.findMany({
				where: { projectId: input.projectId },
				include: {
					user: true,
				},
			});
		}),
	getMyCredits: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.user.userId;
		return await ctx.db.user.findUnique({
			where: { id: userId! },
			select: {
				credits: true,
			},
		});
	}),
	checkCredits: protectedProcedure
		.input(
			z.object({
				githubUrl: z.string(),
				githubToken: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const filesCount = await checkCredits(
				input.githubUrl,
				input.githubToken,
			);
			const userCredits = await ctx.db.user.findUnique({
				where: { id: ctx.user.userId! },
				select: {
					credits: true,
				},
			});
			return { filesCount, userCredits: userCredits?.credits || 0 };
		}),
});
