"use client";

import { cn } from "../../lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-800", className)}
            {...props}
        />
    );
}

export function MapSkeleton() {
    return (
        <div className="w-full h-full min-h-[300px] bg-slate-100 dark:bg-slate-900 rounded-xl flex flex-col items-center justify-center p-8 text-center animate-pulse border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full mb-4 flex items-center justify-center">
                <div className="w-8 h-8 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded opacity-50" />
        </div>
    );
}
