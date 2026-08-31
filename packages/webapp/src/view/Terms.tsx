import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. About these terms",
    paragraphs: [
      "These Terms of Use govern access to and use of voto.io, including its website, applications, polls, live polls, groups, and related services (the Service). By creating an account or using the Service, you agree to these Terms.",
      "If you use the Service for an organisation, you confirm that you have authority to accept these Terms for that organisation.",
    ],
  },
  {
    title: "2. Eligibility and accounts",
    paragraphs: [
      "You must provide accurate, current information and keep your account credentials secure. You are responsible for activity carried out through your account.",
      "You must be old enough to form a binding agreement under the laws that apply to you. Do not use the Service where its use is prohibited.",
    ],
  },
  {
    title: "3. Rules for polls and groups",
    paragraphs: [
      "Poll creators are responsible for the purpose, wording, audience criteria, timing, and use of every poll they create. You must ensure that your polls and group activities comply with all applicable laws, internal rules, and required approvals.",
      "The Service supports decision-making. It does not determine whether a poll is legally valid, binding, fair, or suitable for a particular purpose. Obtain independent legal, electoral, employment, or governance advice where needed.",
    ],
  },
  {
    title: "4. Acceptable use",
    paragraphs: ["You must not use the Service to:"],
    items: [
      "break the law, infringe another person's rights, or violate a duty of confidentiality;",
      "mislead voters, impersonate another person, manipulate results, or interfere with one-person-one-vote protections;",
      "upload harmful code, attempt unauthorised access, disrupt the Service, or probe its security;",
      "collect personal data from other users without a lawful basis or use the Service for spam, harassment, discrimination, or abuse.",
    ],
  },
  {
    title: "5. Your content and data",
    paragraphs: [
      "You retain ownership of content you submit to the Service. You grant us the limited rights needed to host, process, display, secure, and improve the Service for you and the users you invite.",
      "You are responsible for obtaining the permissions and lawful basis required to collect and process participant information. Our handling of personal data is described in the Privacy Notice.",
    ],
  },
  {
    title: "6. Availability and changes",
    paragraphs: [
      "We aim to provide a reliable Service, but it may be unavailable, interrupted, or changed from time to time. We may modify, suspend, or discontinue features when reasonably necessary for security, maintenance, legal compliance, or product improvement.",
      "Keep an appropriate record of important poll information and results. Do not rely on the Service as the only record for decisions with material legal, financial, or operational consequences.",
    ],
  },
  {
    title: "7. Paid plans",
    paragraphs: [
      "Paid plans, prices, billing periods, and included limits are shown before purchase. Fees are due in advance unless stated otherwise. You may cancel a paid plan before its next renewal; access to paid features continues until the end of the current paid period.",
      "Taxes may apply depending on your location. Except where required by law, payments are non-refundable once a paid period has started.",
    ],
  },
  {
    title: "8. Suspension and termination",
    paragraphs: [
      "You may stop using the Service at any time. We may suspend or terminate access when we reasonably believe that you have breached these Terms, created a security risk, or exposed us or others to legal risk.",
      "On termination, provisions that by their nature should continue will remain in effect, including provisions about responsibility, disclaimers, and limitations of liability.",
    ],
  },
  {
    title: "9. Disclaimers and liability",
    paragraphs: [
      "The Service is provided on an as-is and as-available basis. To the fullest extent permitted by law, we disclaim warranties that are not expressly stated in these Terms.",
      "To the fullest extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive losses, or for loss of data, profits, goodwill, or business opportunity arising from use of the Service.",
    ],
  },
  {
    title: "10. Changes to these terms",
    paragraphs: [
      "We may update these Terms from time to time. Material changes will be communicated through the Service or by another reasonable method before they take effect. Continued use after the effective date means that you accept the updated Terms.",
    ],
  },
];

export const Terms = () => (
  <main className="mx-auto max-w-3xl px-4 py-10 sm:px-7 lg:py-16">
    <Link className="font-bold text-blue-700 text-sm no-underline hover:text-blue-600" to="/">
      ← Back to voto.io
    </Link>
    <header className="mt-8 border-slate-200 border-b pb-8">
      <p className="font-bold text-blue-700 text-sm tracking-wider">LEGAL</p>
      <h1 className="mt-2 font-bold text-4xl tracking-tight sm:text-5xl">Terms of Use</h1>
      <p className="mt-4 text-slate-600">Last updated: 31 August 2026</p>
      <p className="mt-6 text-slate-600">Please read these Terms of Use carefully before using voto.io.</p>
    </header>
    <div className="space-y-10 py-10">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="font-bold text-2xl tracking-tight">{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p className="mt-3 text-slate-600" key={paragraph}>
              {paragraph}
            </p>
          ))}
          {section.items && (
            <ul className="mt-3 list-disc space-y-2 pl-6 text-slate-600">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  </main>
);
