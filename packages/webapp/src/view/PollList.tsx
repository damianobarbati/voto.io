import { useWindowVirtualizer } from "@tanstack/react-virtual";
import React from "react";
import { useTranslation } from "react-i18next";
import { FiPlus, FiSearch } from "react-icons/fi";
import useSWRInfinite from "swr/infinite";
import { type PollPageResponse, PollPageResponseSchema } from "types/Poll.ts";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";
import { PollCard } from "#webapp/components/PollCard.tsx";
import { apiUrl } from "#webapp/env.ts";
import { groups } from "#webapp/lib/groups.ts";
import { toPoll } from "#webapp/lib/polls.ts";
import { Spinner } from "#webapp/ui/Spinner.tsx";

type PollSort = "Turnout: low to high" | "Turnout: high to low" | "Votes: low to high" | "Votes: high to low" | "Closing time: soonest" | "Closing time: latest";

const getPollPage = async (url: string): Promise<PollPageResponse> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Unable to retrieve polls");
  const result = PollPageResponseSchema.parse(await response.json());
  return result;
};

export const PollList = () => {
  "use no memo";
  const { t } = useTranslation();
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<PollSort>("Turnout: high to low");
  const [showMyGroups, setShowMyGroups] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = React.useState(0);
  const {
    data,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
    mutate: retry,
  } = useSWRInfinite(
    (index, previousPage: PollPageResponse | null) => {
      if (previousPage && previousPage.nextOffset === null) return null;
      const params = new URLSearchParams({
        offset: String(index === 0 || !previousPage ? 0 : previousPage.nextOffset),
        limit: "20",
        query,
        sort,
        group_ids: showMyGroups
          ? groups
              .filter((group) => group.activeMember)
              .map((group) => group.id)
              .join(",")
          : "",
      });
      return `${apiUrl}/polls/page?${params}`;
    },
    getPollPage,
    { revalidateFirstPage: false, shouldRetryOnError: false },
  );
  const visiblePolls = data ? data.flatMap((page) => page.polls.map(toPoll)) : [];
  const total = data && data.length > 0 ? data[0].total : 0;
  const lastPage = data && data.length > 0 ? data[data.length - 1] : null;
  const hasMore = lastPage !== null && lastPage.nextOffset !== null;
  const rowCount = Math.ceil(visiblePolls.length / 2);
  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 400,
    overscan: 2,
    scrollMargin,
    getItemKey: (index) => visiblePolls[index * 2].id,
  });
  const virtualRows = virtualizer.getVirtualItems();
  const lastRow = virtualRows.at(-1);
  const lastRowIndex = lastRow ? lastRow.index : -1;

  React.useLayoutEffect(() => {
    const updateMargin = () => {
      if (listRef.current) setScrollMargin(listRef.current.getBoundingClientRect().top + window.scrollY);
    };
    updateMargin();
    const observer = new ResizeObserver(updateMargin);
    observer.observe(document.body);
    window.addEventListener("resize", updateMargin);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateMargin);
    };
  }, []);

  React.useEffect(() => {
    if (hasMore && !isValidating && !error && data && data.length === size && lastRowIndex >= rowCount - 2) void setSize(size + 1);
  }, [hasMore, isValidating, error, data, size, lastRowIndex, rowCount, setSize]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="mt-1 font-bold">{total} polls open to you</h1>
        <Link className="hidden items-center gap-2 rounded-app bg-app-primary px-4 py-3 font-bold text-app-inverse no-underline sm:inline-flex" to="/poll/new">
          <FiPlus /> Create poll
        </Link>
      </div>
      <div className="mt-7 flex flex-col gap-2 lg:flex-row lg:items-stretch">
        <label className="flex min-w-0 items-center gap-2 rounded-app border border-app-border bg-app-surface px-3 focus-within:ring-2 focus-within:ring-app-primary lg:flex-1">
          <FiSearch className="shrink-0 text-app-text-muted" />
          <input
            aria-label="Search polls"
            className="min-w-0 grow border-0 py-3 outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search polls"
            value={query}
          />
        </label>
        <button
          aria-pressed={showMyGroups}
          className={`shrink-0 rounded-app border px-3 py-3 ${showMyGroups ? "border-app-primary bg-app-info font-bold text-app-text" : "border-app-border bg-app-surface"}`}
          onClick={() => setShowMyGroups(!showMyGroups)}
          type="button"
        >
          My groups
        </button>
        <select
          aria-label={t("pollList.sortLabel")}
          className="h-[calc(1lh+1.5rem+2px)] min-w-0 rounded-app border border-app-border bg-app-surface px-3 py-3 lg:shrink-0"
          onChange={(event) => setSort(event.target.value as PollSort)}
          value={sort}
        >
          <option value="Turnout: high to low">{t("pollList.turnoutDescending")}</option>
          <option value="Turnout: low to high">{t("pollList.turnoutAscending")}</option>
          <option value="Votes: high to low">{t("pollList.votesDescending")}</option>
          <option value="Votes: low to high">{t("pollList.votesAscending")}</option>
          <option value="Closing time: soonest">{t("pollList.closingSoonest")}</option>
          <option value="Closing time: latest">{t("pollList.closingLatest")}</option>
        </select>
      </div>
      <div className="relative mt-3" ref={listRef} style={{ height: virtualizer.getTotalSize() }}>
        {virtualRows.map((row) => (
          <div
            className="absolute top-0 left-0 grid w-full gap-4 pb-4 md:grid-cols-2"
            data-index={row.index}
            key={row.key}
            ref={virtualizer.measureElement}
            style={{ transform: `translateY(${row.start - scrollMargin}px)` }}
          >
            {visiblePolls.slice(row.index * 2, row.index * 2 + 2).map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        ))}
      </div>
      {(isLoading || (hasMore && isValidating)) && <Spinner />}
      {error && (
        <div role="alert">
          <p>Unable to retrieve polls</p>
          <button className="rounded-app border px-3 py-2" onClick={() => void retry()} type="button">
            Try again
          </button>
        </div>
      )}
      {!isLoading && !error && total === 0 && <p className="py-6 text-app-text-muted">No polls found.</p>}
    </main>
  );
};
