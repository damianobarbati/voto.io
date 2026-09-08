import { BackToVoto } from "#webapp/components/BackToVoto.tsx";
import { Footer } from "#webapp/components/Footer.tsx";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";

export const About = () => (
  <div className="flex min-h-screen flex-col">
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-7 lg:py-16">
      <BackToVoto />
      <p className="mt-8 font-bold text-app-primary tracking-wider">ABOUT US</p>
      <article className="typography mt-2">
        <h1>Better decisions, made together.</h1>
        <p>
          <strong>voto.io</strong> gives communities, organisations, and public institutions a clear way to make collective decisions.
        </p>
        <p>
          We build <b>practical voting tools</b> that help people take part, understand the result, and move forward with confidence.
          <br />
          Every decision should be <em>clear, accessible, and trusted</em> by the people it affects.
        </p>
        <hr />
        <h2>Our purpose</h2>
        <p>
          We make participation easier for groups of every size, from a local association to a national institution. Learn more about{" "}
          <Link to="/terms">how we use the service</Link>.
        </p>
        <h3>What we focus on</h3>
        <p>Our work focuses on three practical outcomes:</p>
        <ul>
          <li>Clear questions that help people make informed choices.</li>
          <li>Simple participation that works on every device.</li>
          <li>Results that are easy to understand and share.</li>
        </ul>
        <h3>How we work</h3>
        <p>We improve the product in a deliberate sequence:</p>
        <ol>
          <li>Listen to the people who need to make a decision.</li>
          <li>Build reliable tools that respect their time.</li>
          <li>Keep improving from real feedback.</li>
        </ol>
        <p>Our standard is simple.</p>
        <blockquote>Good decisions begin when every voice has a practical way to be heard.</blockquote>
        <p>We help groups turn participation into action.</p>
        <small>voto.io is built for clear, collective decisions.</small>
      </article>
    </main>
    <Footer />
  </div>
);
