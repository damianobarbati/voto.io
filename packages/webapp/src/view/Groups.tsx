import React from "react";
import { FiPlus } from "react-icons/fi";
import { EmptyTab } from "#webapp/components/EmptyTab.tsx";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";
import { groups } from "#webapp/lib/groups.ts";

export const Groups = () => {
  const [groupTab, setGroupTab] = React.useState<"joined" | "managed">("joined");
  const visibleGroups = groups.filter((group) => (groupTab === "managed" ? group.owner : !group.owner && group.activeMember));
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-bold text-app-primary tracking-wider">ORGANISATIONS</p>
          <h1 className="mt-1 font-bold">Your groups</h1>
        </div>
        <Link className="inline-flex items-center gap-2 rounded-app bg-app-primary px-4 py-3 font-bold text-app-inverse no-underline" to="/my-groups/new">
          <FiPlus /> Create group
        </Link>
      </div>
      <section className="mt-7 rounded-app border border-app-border bg-app-surface p-5 sm:p-7">
        <div className="flex border-app-border border-b">
          <button
            className={`px-4 py-2 font-bold ${groupTab === "joined" ? "border-app-primary border-b-2 text-app-primary" : "text-app-text-muted"}`}
            onClick={() => setGroupTab("joined")}
            type="button"
          >
            Groups you belong to
          </button>
          <button
            className={`px-4 py-2 font-bold ${groupTab === "managed" ? "border-app-primary border-b-2 text-app-primary" : "text-app-text-muted"}`}
            onClick={() => setGroupTab("managed")}
            type="button"
          >
            Groups you manage
          </button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {visibleGroups.map((group) => (
            <article className="rounded-app border border-app-border p-5" key={group.id}>
              <h2 className="font-bold">{group.name}</h2>
              <p className="mt-1 text-app-text-muted">{group.description}</p>
              <p className="mt-4 font-semibold">
                {group.members} / {group.limit} members
              </p>
            </article>
          ))}
          {visibleGroups.length === 0 &&
            (groupTab === "managed" ? (
              <EmptyTab action="Create group" actionTo="/my-groups/new" message="You do not manage any groups yet." />
            ) : (
              <EmptyTab action="Explore polls" actionTo="/poll/list" message="You do not belong to any groups yet." />
            ))}
        </div>
        <div className="mt-8 text-center">
          <p className="text-app-text-muted">Upgrade to create and manage private groups.</p>
          <Link className="mt-3 inline-block rounded-app bg-app-primary px-4 py-2 font-bold text-app-inverse no-underline" to="/plans">
            Upgrade plan
          </Link>
        </div>
      </section>
    </main>
  );
};
