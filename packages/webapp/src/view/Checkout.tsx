import { useLocation } from "react-router-dom";
import { useLocalizedNavigate as useNavigate } from "#webapp/hooks/useLocalizedNavigate.ts";
import { planFromSearch } from "#webapp/lib/plans.ts";

export const Checkout = () => {
  const navigate = useNavigate();
  const plan = planFromSearch(useLocation().search) ?? "Small";
  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:px-7">
      <h1 className="font-bold">Checkout</h1>
      <form
        className="mt-7 space-y-5 rounded-app border border-app-border bg-app-surface p-5 sm:p-7"
        onSubmit={(event) => {
          event.preventDefault();
          navigate(`/my-subscription?plan=${plan.toLowerCase()}`);
        }}
      >
        <p className="font-bold">{plan} plan</p>
        <fieldset>
          <legend className="font-bold">Payment method</legend>
          <div className="mt-3 space-y-2">
            {["Credit card", "PayPal", "Apple Pay"].map((method) => (
              <label className="flex items-center gap-2" key={method}>
                <input defaultChecked={method === "Credit card"} name="payment-method" type="radio" /> {method}
              </label>
            ))}
          </div>
        </fieldset>
        <button className="rounded-app bg-app-primary px-5 py-3 font-bold text-app-inverse" type="submit">
          Complete purchase
        </button>
      </form>
    </main>
  );
};
