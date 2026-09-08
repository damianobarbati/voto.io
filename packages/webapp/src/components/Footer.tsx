import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";

export const Footer = () => (
  <footer className="shrink-0 border-slate-800 border-t bg-slate-950 px-4 py-6 text-slate-300 sm:px-7">
    <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Link className="font-bold text-white no-underline hover:text-blue-400" to="/">
        voto<span className="text-blue-500">.</span>io
      </Link>
      <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2">
        <Link className="text-slate-300 no-underline hover:text-white" to="/about">
          About us
        </Link>
        <Link className="text-slate-300 no-underline hover:text-white" to="/contact">
          Contact us
        </Link>
        <Link className="text-slate-300 no-underline hover:text-white" to="/terms">
          Terms
        </Link>
      </nav>
    </div>
  </footer>
);
