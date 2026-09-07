import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const BackToVoto = () => {
  const { t } = useTranslation();

  return (
    <Link className="font-bold text-blue-700 text-sm no-underline hover:text-blue-600" to="/">
      ← {t("ui.termsBack")}
    </Link>
  );
};
