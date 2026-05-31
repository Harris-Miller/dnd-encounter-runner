import { PostgrestError } from '@supabase/supabase-js';
import type { DefaultError, EnsureQueryDataOptions, QueryClient, QueryKey } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';

const isPostgrestNotFoundError = (error: unknown): boolean =>
  error instanceof PostgrestError && error.code === 'PGRST116';

export const fetchQueryOrNotFound = async <
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryClient: QueryClient,
  queryOptions: EnsureQueryDataOptions<TQueryFnData, TError, TData, TQueryKey>,
): Promise<TData> => {
  try {
    return await queryClient.fetchQuery(queryOptions);
  } catch (error) {
    if (isPostgrestNotFoundError(error)) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router notFound API
      throw notFound();
    }

    throw error;
  }
};
