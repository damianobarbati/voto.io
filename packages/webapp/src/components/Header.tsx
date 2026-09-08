import React from "react";
import { useTranslation } from "react-i18next";
import { FiChevronDown, FiMenu, FiPlus, FiX } from "react-icons/fi";
import { useLocation, useNavigate as useRouterNavigate } from "react-router-dom";
import type { User } from "types/User.ts";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";
import { useLocalizedNavigate as useNavigate } from "#webapp/hooks/useLocalizedNavigate.ts";
import { i18n } from "#webapp/i18n.ts";
import { localizedPath } from "#webapp/language.ts";
import { registrationStorageKey } from "#webapp/lib/auth.ts";
import { jwtStorageKey, store } from "#webapp/store.ts";

const languages = [
  { value: "en", label: "🇬🇧 English" },
  { value: "es", label: "🇪🇸 Español" },
  { value: "de", label: "🇩🇪 Deutsch" },
  { value: "fr", label: "🇫🇷 Français" },
  { value: "it", label: "🇮🇹 Italiano" },
];

type HeaderProps = { user: User | null };

export const Header = ({ user }: HeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const location = useLocation();
  const navigateLanguage = useRouterNavigate();
  const [isCreateMenuOpen, setIsCreateMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const isLoggedIn = user !== null;
  const changeLanguage: React.ChangeEventHandler<HTMLSelectElement> = async (event) => {
    const selectedLanguage = event.target.value;
    await navigateLanguage(`${localizedPath({ path: location.pathname, language: selectedLanguage })}${location.search}${location.hash}`);
  };
  const logout = () => {
    store.persist.clearStorage();
    store.getState().logout();
    localStorage.removeItem(jwtStorageKey);
    localStorage.removeItem(registrationStorageKey);
    navigate("/");
  };
  return (
    <header className="border-slate-800 border-b bg-slate-950 px-4 py-3 shadow-lg sm:px-7">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link className="font-bold text-white tracking-tight no-underline" to="/">
            voto<span className="text-blue-500">.</span>io
          </Link>
          <nav aria-label="Primary navigation" className="hidden items-center gap-5 md:flex">
            <Link className="text-slate-300 no-underline hover:text-white" to="/poll/list">
              Explore
            </Link>
            {isLoggedIn ? (
              <>
                <Link className="text-slate-300 no-underline hover:text-white" to="/my-polls">
                  {t("nav.polls")}
                </Link>
                <Link className="text-slate-300 no-underline hover:text-white" to="/my-groups">
                  {t("nav.groups")}
                </Link>
              </>
            ) : (
              <Link className="text-slate-300 no-underline hover:text-white" to="/plans">
                {t("ui.plans")}
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              aria-expanded={isCreateMenuOpen}
              className="inline-flex items-center gap-1 rounded-app bg-blue-600 px-3 py-2 font-bold text-white hover:bg-blue-500"
              onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
              type="button"
            >
              <FiPlus aria-hidden="true" />
              <span className="hidden sm:inline">Create</span>
              <FiChevronDown aria-hidden="true" className="hidden sm:block" />
            </button>
            {isCreateMenuOpen && (
              <div className="absolute top-full right-0 z-20 mt-2 w-44 rounded-app border border-slate-200 bg-white p-2 shadow-lg">
                <Link
                  className="block rounded-app px-3 py-2 font-semibold text-slate-800 no-underline hover:bg-slate-100"
                  onClick={() => setIsCreateMenuOpen(false)}
                  to="/poll/new"
                >
                  {t("nav.createPoll")}
                </Link>
                <Link
                  className="block rounded-app px-3 py-2 font-semibold text-slate-800 no-underline hover:bg-slate-100"
                  onClick={() => setIsCreateMenuOpen(false)}
                  to="/live-poll/new"
                >
                  {t("nav.createLivePoll")}
                </Link>
              </div>
            )}
          </div>
          <select
            aria-label={t("nav.language")}
            className="hidden rounded-app border border-slate-700 bg-slate-900 px-2 py-1 text-white sm:block"
            onChange={changeLanguage}
            value={language}
          >
            {languages.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
          {isLoggedIn ? (
            <div className="relative hidden sm:block" onMouseLeave={() => setIsProfileMenuOpen(false)}>
              <button
                aria-expanded={isProfileMenuOpen}
                className="rounded-app border border-slate-600 px-3 py-2 font-bold text-white hover:border-white"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                type="button"
              >
                {user.name}
              </button>
              {isProfileMenuOpen && (
                <div className="absolute top-full right-0 z-20 w-44 pt-2">
                  <div className="rounded-app border border-slate-200 bg-white p-2 shadow-lg">
                    <Link className="block rounded-app px-3 py-2 font-semibold text-slate-800 no-underline hover:bg-slate-100" to="/my-polls">
                      {t("nav.polls")}
                    </Link>
                    <Link className="block rounded-app px-3 py-2 font-semibold text-slate-800 no-underline hover:bg-slate-100" to="/my-groups">
                      {t("nav.groups")}
                    </Link>
                    <Link className="block rounded-app px-3 py-2 font-semibold text-slate-800 no-underline hover:bg-slate-100" to="/my-subscription">
                      {t("nav.subscription")}
                    </Link>
                    <Link className="block rounded-app px-3 py-2 font-semibold text-slate-800 no-underline hover:bg-slate-100" to="/my-profile">
                      {t("nav.profile")}
                    </Link>
                    <Link className="block rounded-app px-3 py-2 font-semibold text-slate-800 no-underline hover:bg-slate-100" to="/my-settings">
                      {t("nav.settings")}
                    </Link>
                    <button className="w-full rounded-app px-3 py-2 text-left font-semibold text-red-700 hover:bg-red-50" onClick={logout} type="button">
                      {t("nav.logout")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link className="hidden rounded-app border border-slate-600 px-3 py-2 font-bold text-white no-underline hover:border-white sm:block" to="/login">
              {t("nav.login")}
            </Link>
          )}
          <button
            aria-expanded={isMobileMenuOpen}
            aria-label="Open navigation"
            className="rounded-app p-2 text-white hover:bg-slate-800 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            type="button"
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
        {isMobileMenuOpen && (
          <nav aria-label="Mobile navigation" className="absolute top-full right-0 left-0 z-10 border-slate-800 border-t bg-slate-950 p-4 shadow-lg md:hidden">
            <div className="grid gap-1">
              <Link className="rounded-app px-3 py-2 font-semibold text-slate-200 no-underline hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)} to="/poll/list">
                Explore
              </Link>
              {isLoggedIn ? (
                <>
                  <Link className="rounded-app px-3 py-2 font-semibold text-slate-200 no-underline hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)} to="/my-polls">
                    {t("nav.polls")}
                  </Link>
                  <Link className="rounded-app px-3 py-2 font-semibold text-slate-200 no-underline hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)} to="/my-groups">
                    {t("nav.groups")}
                  </Link>
                  <Link
                    className="rounded-app px-3 py-2 font-semibold text-slate-200 no-underline hover:bg-slate-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                    to="/my-subscription"
                  >
                    {t("nav.subscription")}
                  </Link>
                  <Link className="rounded-app px-3 py-2 font-semibold text-slate-200 no-underline hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)} to="/my-profile">
                    {t("nav.profile")}
                  </Link>
                  <Link className="rounded-app px-3 py-2 font-semibold text-slate-200 no-underline hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)} to="/my-settings">
                    {t("nav.settings")}
                  </Link>
                  <button className="rounded-app px-3 py-2 text-left font-semibold text-red-300 hover:bg-slate-800" onClick={logout} type="button">
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link className="rounded-app px-3 py-2 font-semibold text-slate-200 no-underline hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)} to="/plans">
                    {t("ui.plans")}
                  </Link>
                  <Link className="rounded-app px-3 py-2 font-semibold text-slate-200 no-underline hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)} to="/login">
                    {t("nav.login")}
                  </Link>
                </>
              )}
              <select
                aria-label={t("nav.language")}
                className="mt-2 rounded-app border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                onChange={changeLanguage}
                value={language}
              >
                {languages.map((language) => (
                  <option key={language.value} value={language.value}>
                    {language.label}
                  </option>
                ))}
              </select>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
