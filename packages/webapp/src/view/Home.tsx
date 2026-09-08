import React from "react";
import { useLocation } from "react-router-dom";
import { Footer } from "#webapp/components/Footer.tsx";
import { Header } from "#webapp/components/Header.tsx";
import { pathWithoutLanguage } from "#webapp/language.ts";
import { store } from "#webapp/store.ts";
import { Checkout } from "#webapp/view/Checkout.tsx";
import { CreatePoll } from "#webapp/view/CreatePoll.tsx";
import { Creator } from "#webapp/view/Creator.tsx";
import { GroupDetail } from "#webapp/view/GroupDetail.tsx";
import { GroupNew } from "#webapp/view/GroupNew.tsx";
import { Groups } from "#webapp/view/Groups.tsx";
import { Landing } from "#webapp/view/Landing.tsx";
import { LivePoll } from "#webapp/view/LivePoll.tsx";
import { LiveVoter } from "#webapp/view/LiveVoter.tsx";
import { Login } from "#webapp/view/Login.tsx";
import { MyPolls } from "#webapp/view/MyPolls.tsx";
import { Plans } from "#webapp/view/Plans.tsx";
import { PollDetail } from "#webapp/view/PollDetail.tsx";
import { PollList } from "#webapp/view/PollList.tsx";
import { Profile } from "#webapp/view/Profile.tsx";
import { Register } from "#webapp/view/Register.tsx";
import { ResultsPage } from "#webapp/view/ResultsPage.tsx";
import { Settings } from "#webapp/view/Settings.tsx";
import { Subscription } from "#webapp/view/Subscription.tsx";

export const Home = () => {
  const path = pathWithoutLanguage({ pathname: useLocation().pathname });
  const [user, setUser] = React.useState(store.getState().user);
  React.useEffect(() => store.subscribe((state) => setUser(state.user)), []);
  const isLivePoll = path.startsWith("/live-poll/");
  const isLiveVoter = path.endsWith("/vote") && isLivePoll;
  let page = <Landing />;
  if (path.endsWith("/stats")) page = <ResultsPage />;
  else if (path === "/poll/new") page = <CreatePoll />;
  else if (path === "/poll/list") page = <PollList />;
  else if (path.startsWith("/poll/")) page = <PollDetail />;
  else if (path === "/my-groups") page = <Groups />;
  else if (path === "/my-groups/new") page = <GroupNew />;
  else if (path.startsWith("/my-groups/")) page = <GroupDetail />;
  else if (path === "/register") page = <Register />;
  else if (path === "/login") page = <Login />;
  else if (path === "/my-profile") page = <Profile />;
  else if (path === "/my-polls") page = <MyPolls />;
  else if (path === "/my-settings") page = <Settings />;
  else if (path === "/my-subscription") page = <Subscription />;
  else if (path === "/plans") page = <Plans />;
  else if (path === "/checkout") page = <Checkout />;
  else if (path.startsWith("/u/")) page = <Creator />;
  else if (isLiveVoter) page = <LiveVoter />;
  else if (isLivePoll) page = <LivePoll />;
  return (
    <div className="flex min-h-screen flex-col">
      {!isLivePoll && <Header user={user} />}
      <div className="flex-1">{page}</div>
      {!isLivePoll && <Footer />}
    </div>
  );
};
