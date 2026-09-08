import React from "react";

export const desktopMinimumWidth = 1280;

export const useViewportWidth = () => {
  const [width, setWidth] = React.useState(() => (typeof window === "undefined" ? desktopMinimumWidth : window.innerWidth));
  React.useEffect(() => {
    const updateWidth = () => setWidth(window.innerWidth);
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);
  return width;
};
