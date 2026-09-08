import React from "react";
import { useForm } from "react-hook-form";
import { BackToVoto } from "#webapp/components/BackToVoto.tsx";
import { Footer } from "#webapp/components/Footer.tsx";

type ContactFormValues = { email: string; message: string };

export const Contact = () => {
  const form = useForm<ContactFormValues>();
  const [isSent, setIsSent] = React.useState(false);

  const send = (_values: ContactFormValues) => {
    setIsSent(true);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-7 lg:py-16">
        <BackToVoto />
        <p className="mt-8 font-bold text-blue-700 tracking-wider">CONTACT US</p>
        <h1 className="mt-2 font-bold tracking-tight">How can we help?</h1>
        <form className="mt-8 space-y-5 rounded-app border border-slate-200 bg-white p-5 sm:p-7" onSubmit={form.handleSubmit(send)}>
          <label className="block font-semibold">
            Email
            <input
              autoComplete="email"
              className="mt-1.5 w-full rounded-app border border-slate-300 bg-white px-3 py-2.5 font-normal"
              type="email"
              {...form.register("email", { required: true })}
            />
          </label>
          <label className="block font-semibold">
            Message
            <textarea className="mt-1.5 min-h-32 w-full rounded-app border border-slate-300 bg-white px-3 py-2.5 font-normal" {...form.register("message", { required: true })} />
          </label>
          <button className="rounded-app bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-600" type="submit">
            Send
          </button>
          {isSent && <p className="text-green-700">Your message has been sent.</p>}
        </form>
      </main>
      <Footer />
    </div>
  );
};
