import { Card, CardBody, Skeleton } from '@heroui/react';

export function CourseCardSkeleton() {
  return (
    <Card className="w-full space-y-4 border border-divider p-0" radius="lg" shadow="sm">
      <Skeleton className="rounded-none"><div className="aspect-video" /></Skeleton>
      <CardBody className="space-y-3">
        <Skeleton className="w-1/3 rounded-lg"><div className="h-3" /></Skeleton>
        <Skeleton className="w-4/5 rounded-lg"><div className="h-5" /></Skeleton>
        <Skeleton className="w-2/3 rounded-lg"><div className="h-3" /></Skeleton>
        <Skeleton className="w-1/4 rounded-lg"><div className="h-4" /></Skeleton>
      </CardBody>
    </Card>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => <CourseCardSkeleton key={i} />)}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i} shadow="sm"><CardBody className="flex flex-row items-center gap-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full"><div className="h-10 w-10" /></Skeleton>
          <div className="w-full space-y-2">
            <Skeleton className="w-2/5 rounded-lg"><div className="h-4" /></Skeleton>
            <Skeleton className="w-3/5 rounded-lg"><div className="h-3" /></Skeleton>
          </div>
        </CardBody></Card>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Card shadow="sm"><CardBody className="space-y-3" aria-busy="true" aria-label="Loading">
      <Skeleton className="rounded-lg"><div className="h-8" /></Skeleton>
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="rounded-lg"><div className="h-6" /></Skeleton>)}
    </CardBody></Card>
  );
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} shadow="sm"><CardBody className="space-y-3">
          <Skeleton className="w-1/2 rounded-lg"><div className="h-3" /></Skeleton>
          <Skeleton className="w-1/3 rounded-lg"><div className="h-7" /></Skeleton>
        </CardBody></Card>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading page">
      <div className="space-y-2">
        <Skeleton className="w-1/3 rounded-lg"><div className="h-8" /></Skeleton>
        <Skeleton className="w-1/2 rounded-lg"><div className="h-4" /></Skeleton>
      </div>
      <StatsSkeleton />
      <CardGridSkeleton count={3} />
    </div>
  );
}

export function PlayerSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]" aria-busy="true" aria-label="Loading lesson">
      <div className="space-y-4">
        <Skeleton className="rounded-lg"><div className="aspect-video" /></Skeleton>
        <Skeleton className="w-2/3 rounded-lg"><div className="h-7" /></Skeleton>
        <Skeleton className="rounded-lg"><div className="h-24" /></Skeleton>
      </div>
      <ListSkeleton rows={6} />
    </div>
  );
}
