import { useTranslation } from "react-i18next";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";

export const BackToVoto = () => {
  const { t } = useTranslation();

  return (
    <Link className="font-bold text-blue-700 no-underline hover:text-blue-600" to="/">
      ← {t("ui.termsBack")}
    </Link>
  );
};
