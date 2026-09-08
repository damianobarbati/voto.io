import { type NavigateOptions, useNavigate, useParams } from "react-router-dom";
import { localizedPath } from "#webapp/language.ts";

export const useLocalizedNavigate = () => {
  const navigate = useNavigate();
  const { language } = useParams();
  return (to: string, options?: NavigateOptions) => navigate(language ? localizedPath({ path: to, language }) : to, options);
};
