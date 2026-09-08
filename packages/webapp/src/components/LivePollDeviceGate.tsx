import { FiSmartphone } from "react-icons/fi";
import { LocalizedLink as Link } from "#webapp/components/LocalizedLink.tsx";

type LivePollDeviceGateProps = { message: string };

export const LivePollDeviceGate = ({ message }: LivePollDeviceGateProps) => (
  <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-5 text-center">
    <FiSmartphone className="size-16 text-app-primary" />
    <h1 className="mt-5 font-bold">Device not supported</h1>
    <p className="mt-3 text-app-text-muted">{message}</p>
    <Link className="mt-7 rounded-app bg-app-primary px-5 py-3 font-bold text-app-inverse no-underline" to="/">
      Back to voto.io
    </Link>
  </main>
);
