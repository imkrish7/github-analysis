"use client";
import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ExternalLink, UserCircle } from "lucide-react";
import Link from "next/link";
import React from "react";

const CommitLog = () => {
  const { projectId, project } = useProject();
  const { data: commits } = api.project.getCommits.useQuery({
    projectId,
  });
  return (
    <>
      <ul className="list-none space-y-8">
        {commits?.map((commit, index) => {
          return (
            <li key={index} className="relative flex list-none gap-x-4">
              <div
                className={cn(
                  index === commits.length - 1 ? "h-6" : "-bottom-8",
                  "absolute left-0 top-0 flex w-6 justify-center",
                )}
              >
                <div className="w-px translate-x-1 bg-gray-200"></div>
              </div>
              <>
                {commit.commitAuthorAvatar ? (
                  <img
                    src={commit.commitAuthorAvatar}
                    alt="Author avatar"
                    className="relative mt-4 size-8 flex-none rounded-full bg-gray-50"
                  />
                ) : (
                  <UserCircle className="h-8 w-8" />
                )}
                <div className="ring-gray-20 flex-auto rounded-md bg-white p-3 ring-1 ring-inset">
                  <div className="flex justify-between gap-x-4">
                    <Link
                      target="_blank"
                      href={`${project?.githubUrl}/commit/${commit.commitHash}.diff`}
                      className="py-0.5 text-xs leading-5"
                    >
                      <span className="font-medium text-gray-900">
                        {commit.commitAuthorName}
                      </span>
                      <span className="inline-flex items-center">
                        commited <ExternalLink className="ml-1 size-4" />
                      </span>
                    </Link>
                  </div>
                  <span className="font-semibold">{commit.commitMessage}</span>
                  <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-600">
                    {commit.summary}
                  </pre>
                </div>
              </>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default CommitLog;
