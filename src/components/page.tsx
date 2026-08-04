import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { statusText, tone } from "@/lib/format";
import { cn } from "@/lib/utils";

export function BackButton({ to = "/" }: { to?: string }) {
  return (
    <Button variant="outline" size="sm" asChild className="gap-1">
      <Link to={to}>
        <ArrowRight className="h-4 w-4" />
        رجوع للرئيسية
      </Link>
    </Button>
  );
}

export function PageHeader({
  title,
  description,
  action,
  back = true,
  backTo = "/",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  back?: boolean;
  backTo?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-4">
      <div>
        {back && (
          <div className="mb-2">
            <BackButton to={backTo} />
          </div>
        )}
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}


export function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">{children}</div>;
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || action) && (
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            {title && <CardTitle className="text-base">{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action}
        </CardHeader>
      )}
      <CardContent className={cn(!title && "pt-6")}>{children}</CardContent>
    </Card>
  );
}

export function StatusChip({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return (
    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium", tone(value))}>
      {statusText[value] ?? value}
    </span>
  );
}

export function LoadingRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-12 text-center">
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ErrorState({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "خطأ غير متوقع";
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
      تعذّر تحميل البيانات: {message}
    </div>
  );
}

/** غلاف حالات: تحميل / خطأ / فراغ / محتوى */
export function DataState<T>({
  isPending,
  error,
  data,
  empty,
  children,
}: {
  isPending: boolean;
  error: unknown;
  data: T[] | null | undefined;
  empty: string;
  children: (rows: T[]) => ReactNode;
}) {
  if (isPending) return <LoadingRows />;
  if (error) return <ErrorState error={error} />;
  if (!data || data.length === 0) return <EmptyState title={empty} />;
  return <>{children(data)}</>;
}
