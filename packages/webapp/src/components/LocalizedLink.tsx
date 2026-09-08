import { Link, type LinkProps, useParams } from "react-router-dom";
import { localizedPath } from "#webapp/language.ts";

type LocalizedLinkProps = LinkProps;

export const LocalizedLink = ({ to, ...props }: LocalizedLinkProps) => {
  const { language } = useParams();
  let destination = to;
  if (language) {
    if (typeof to === "string") destination = localizedPath({ path: to, language });
    else if (to.pathname) destination = { ...to, pathname: localizedPath({ path: to.pathname, language }) };
  }
  return <Link {...props} to={destination} />;
};
