import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";

export const Footer = () => (
  <footer className="shrink-0 border-app-text border-t bg-app-text px-4 py-6 text-app-info sm:px-7">
    <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Link className="font-bold text-app-inverse no-underline hover:text-app-accent" to="/">
        voto<span className="text-app-accent">.</span>io
      </Link>
      <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2">
        <Link className="text-app-info no-underline hover:text-app-inverse" to="/about">
          About us
        </Link>
        <Link className="text-app-info no-underline hover:text-app-inverse" to="/contact">
          Contact us
        </Link>
        <Link className="text-app-info no-underline hover:text-app-inverse" to="/terms">
          Terms
        </Link>
      </nav>
    </div>
  </footer>
);
