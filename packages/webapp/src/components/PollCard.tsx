import { useTranslation } from "react-i18next";
import { FiArrowRight } from "react-icons/fi";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";
import { LockBadge } from "#webapp/components/LockBadge.tsx";
import { VotingMethodIcon } from "#webapp/components/VotingMethodIcon.tsx";
import { formatDate } from "#webapp/i18n.ts";
import { groupFor } from "#webapp/lib/groups.ts";
import { type Poll, pollTurnout } from "#webapp/lib/polls.ts";

type PollCardProps = { poll: Poll };

export const PollCard = ({ poll }: PollCardProps) => {
  const { i18n: translationI18n, t } = useTranslation();
  const locale = translationI18n.resolvedLanguage ?? translationI18n.language;
  const closeDate = formatDate({ date: poll.closesAt, locale });
  const group = groupFor(poll.groupId);
  const turnout = pollTurnout(poll).toFixed(1);
  return (
    <article className="flex min-w-0 flex-col rounded-app border border-slate-200 bg-white p-5 shadow-sm">
      {group && (
        <div className="mb-3">
          <LockBadge group={group} />
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold">{poll.title}</h3>
        <VotingMethodIcon votingMethod={poll.votingMethod} />
      </div>
      <p className="mt-2 text-slate-500">
        {t("ui.publishedBy")}{" "}
        <Link className="font-bold text-blue-700 no-underline" to="/u/1">
          {poll.authorName}
        </Link>
      </p>
      <div className="mt-5 flex justify-between border-slate-100 border-t pt-4 text-slate-500">
        <span>
          {poll.votes.toLocaleString(locale)} {t("common.votes")} · {turnout}% {t("landing.turnout")}
        </span>
        <span>{t("ui.closes", { date: closeDate })}</span>
      </div>
      <Link className="mt-4 flex items-center justify-between font-bold text-blue-700 no-underline" to={`/poll/${poll.id}`}>
        {t("common.openPoll")} <FiArrowRight />
      </Link>
    </article>
  );
};
