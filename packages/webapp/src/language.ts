export const supportedLanguages = ["en", "es", "de", "fr", "it"];
export const languageStorageKey = "voto.language";

export const languageFromPath = ({ pathname }: { pathname: string }): string | undefined => {
  const language = pathname.split(/[/?#]/)[1];
  return supportedLanguages.includes(language) ? language : undefined;
};

export const pathWithoutLanguage = ({ pathname }: { pathname: string }): string => {
  const language = languageFromPath({ pathname });
  return language ? pathname.slice(language.length + 1) || "/" : pathname;
};

export const localizedPath = ({ path, language }: { path: string; language: string }): string => {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const pathname = pathWithoutLanguage({ pathname: path });
  return `/${language}${pathname === "/" ? "" : pathname}`;
};

export const preferredLanguage = (): string => {
  const savedLanguage = localStorage.getItem(languageStorageKey);
  if (savedLanguage && supportedLanguages.includes(savedLanguage)) return savedLanguage;
  const browserLanguage = navigator.language.toLowerCase().split("-")[0];
  return supportedLanguages.includes(browserLanguage) ? browserLanguage : "en";
};
