import { Navigate, useLocation } from "react-router-dom";
import { localizedPath, preferredLanguage } from "#webapp/language.ts";

export const LanguageRedirect = () => {
  const { pathname, search, hash } = useLocation();
  const path = localizedPath({ path: pathname, language: preferredLanguage() });
  return <Navigate replace to={`${path}${search}${hash}`} />;
};
