import { useQuery } from "@tanstack/react-query";
import { useAccount } from "./use-account";

type Result = { data: unknown; error: { message: string } | null };

/** استعلام مرتبط بالموقع النشط — يعمل عبر RLS من عميل المتصفح. */
export function useSiteQuery<T>(
  key: (string | number | null | undefined)[],
  fn: (siteId: string) => PromiseLike<Result>,
) {
  const { data: acc, isPending: accPending } = useAccount();
  const siteId = acc?.activeSite?.id;

  const q = useQuery({
    queryKey: [...key, siteId],
    enabled: Boolean(siteId),
    queryFn: async () => {
      const { data, error } = await fn(siteId as string);
      if (error) throw new Error(error.message);
      return (data ?? null) as T;
    },
  });

  return { ...q, siteId, isPending: accPending || q.isPending };
}
