import { useTranslation } from "react-i18next";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";

export const BackToVoto = () => {
  const { t } = useTranslation();

  return (
    <Link className="font-bold text-app-primary no-underline hover:text-app-primary" to="/">
      ← {t("ui.termsBack")}
    </Link>
  );
};
