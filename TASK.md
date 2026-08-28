The task is to create a responsive design (mock api calls or data) for the "voto.io" webapp.

Supported resolutions are desktop (1280 x 700), tablet (800 x 600) and mobile (480 x 320).

The app is an application where users can register, and then:
- create polls
- vote polls

The homepage (at /) is the landing page explaining the app, with an highlight on top voted and still open polls.

The poll list page (at /polls) is the page where users can see all the polls, filter the ones he can vote, open a poll, or create a new poll.

The poll form (at /poll/new) is the page where users can create a new poll.
When creating a poll, the user must provide:
- name of the poll
- description of the poll
- opening datetime
- closing datetime
- restriction for gender
- restriction for income
- restriction for city (or group of cities)
- restriction for country
- if it's a one-choice poll or multiple choice poll or ranked choice poll
- options for the poll (max 5)

If the creator selects a ranked-choice poll, then he is given the choice between:
- Instant runoff (majority-based - IRV): Eliminates lowest-ranked options in successive rounds until one option secures an absolute majority (>50%). Ideal for electing a single clear winner.
- Bord count: (Consensus-based): Assigns decreasing point values based on rank position (e.g., 1st = N points, 2nd = N-1 points). Sums all points to determine the winner. Ideal for finding the broadest compromise option.

The poll page (at /poll/:id) is the page where users can see the details of a poll, vote it, or see the results.
When voting a poll, the user selects:
- one option if the poll is a one-choice poll
- many options if the poll is a multiple choices poll
- sort the options if the poll is a ranked choice poll

One option polls and many options polls must have at least 2 options.  
An additional "No suitable option" is always created for them.

The results page of the poll (at /poll/:id/results) is the page where users can see the results of a poll.
Charts are provided with a breakdown of:
- % and absolute number of votes for every single choices (sorted)
- % of registered users who are eligible for the poll and voted the poll
- breakdown per age range (14-18 19-24 24-30 31-40 41-50 51-60 60+)
- breakdown per income range (0-10k 11k-20k 21k-30k 31k-40k 41k-50k 51k-60k 61k-100k 100k+)
- breakdown per city

To create a poll or vote a poll, the user must first register.  
Every user must register providing the following information:
- first name
- last name
- birth date
- gender (m or f)
- gross income per year
- city and country
- email
- password

## Poll size and monetization system

There are 3 plans available:
- small: $9/mo with groups of maximum 100 members and live polls with max 1000 live voters
- big: 90$/mo with groups of maximum 1000 members and live polls with max 10_000 live voters
- unlimited: 900$/mo with groups of unlimited members and live polls with unlimited live voters

Live poll feature is free for all registed users for up to live 100 users.

## Organization support
Add support for Organizations (e.g., Political Parties, Companies) to create prviate groups and invite specific members to them by email.  
Restrict poll visibility and voting exclusively to those group members. This is a core monetization feature.  

The page groups list (`/groups`) provides an overview of owned and joined groups. 
It shows the option to upgrade to a paid plan to unlock groups.  

The page group creation (`/group/new`) allows to create a new group, providing:
- group name
- description
- image
- textarea with list of emails to import
- option to send invitation email

The page group (`/group/:id`) allows to edit the group and to see a list of all emails invited, with its invitation status (pending, accepted, rejected).

Paying users see in the poll creation form the option "access control" to restrict the poll to a specific group they created, chosen from a dropdown. 

Show a visual lock badge (e.g., "Exclusive to you belonging to [Group Name]") on private polls for eligible members.
Show an Access Denied state if a non-member accesses a private poll URL directly ("This poll is restricted to members of [Group Name]").

To vote on a private poll, a user must be an active member of the assigned group AND satisfy all existing demographic restrictions (gender, income, city, country).

## Look & Feel

Look must be aggressive, corporate, minimal.  
No useless writings, sentences, or captions around not providing any useful info for the user.  
Add language selection, with default support for languages: english, spanish, german, french, italian.  
Language is automatically chosen upon browser language.

## Communication

Hereafter the english motto: "Power to your choice."
Hereafter the italian motto: "Potere alla tua scelta."

Hereafter the italian description:
"Voto.io è la piattaforma progettata per gestire votazioni di qualsiasi scala.  
Cittadini, aziende, partiti e istituzioni pubbliche possono raccogliere voti per trasformare l'opinione collettiva in decisioni vincolanti."

Hereafter the english description:
"Voto.io is the platform designed to manage voting at any scale.  
Citizens, companies, political parties, and public institutions can collect votes to transform collective opinion into binding decisions."

Why voto.io?
Direct democracy has always been considered a logistical utopia, applicable only to small communities or rare, expensive consultations.  
Today, technology has eliminated coordination costs and entry barriers, making possible what was unthinkable until recently.  
Voto.io was created to leverage existing technology to offer a tool that allows anyone—from individual citizens to an entire nation—to make collective decisions.

Perchè voto.io?
La democrazia diretta è sempre stata considerata un'utopia logistica, applicabile solo a piccole comunità o a consultazioni rare e costose.  
Oggi, la tecnologia ha azzerato i costi di coordinamento e le barriere d'accesso, rendendo possibile ciò che fino a poco tempo fa era impensabile.  
Voto.io nasce per sfruttare la tecnologia esistente e offrire uno strumento che permette a chiunque, dal singolo cittadino fino a un'intera nazione, di prendere decisioni collettive.  

## Glossary

Use the following terms and no synonyms when indicating the concept:
- Poll, Votazione

## Homepage

The hero in the homepage must be structured as follows:
- left side with motto, below the descrizione, below the CTAs "Poll" and "Vote".
- right side with placeholder image (in the future a screenshot of the app will be put there).

## Poll results

Top indicators bar displaying core participation metrics and visible for all poll types:
- **Total Votes Cast:** Absolute number of voters who submitted a ballot.
- **Eligible Turnout %:** Percentage of registered eligible users who voted.
- **Poll Status / Remaining Time:** Time left until closing, "Not Yet Open", or "Closed".
- **Explicit Abstention Rate:** % of voters who chose "No suitable option".

### For or one-choice polls
Primary Results Box:
- Vertical bar chart or list showing every choice.
- Displayed for each choice: **Absolute Votes** and **% of Total Votes**.
- Sorted in descending order by vote percentage.
- "No suitable option" is displayed as a distinct item within the list.
Demographic Breakdown Box:
- Multi-tab or grid section breaking down the voter base by:
    - **Gender:** Distribution by gender (Male / Female).
    - **Age:** Distribution across age groups (14-18, 19-24, 25-30, 31-40, 41-50, 51-60, 60+).
    - **Income:** Distribution across gross annual income bands.
    - **Geography:** Distribution by City and Country.
- For each segment, display both **segment turnout** and **option preference distribution within that segment**.

### For many-choice polls

Primary Results Box:
- Grouped bar chart or dual-metric table showing every choice.
- Displayed for each choice:
    - **% of Voters:** Percentage of total voters who included this option in their ballot (sum > 100%).
    - **% of Total Selections:** Percentage of all individual selections made across all ballots (sum = 100%).
    - **Absolute Votes:** Total number of times the option was selected.
- Sorted in descending order by `% of Voters`.
Demographic Breakdown Box:
- Same structure as One-Choice Polls (Age, Gender, Income, Geography).
- Computes option selection rates independently within each demographic segment.

### Ranked-choice polls

Primary Results Box (Algorithm Dependent):
If Algorithm is `irv` (Instant-Runoff Voting):
- **Winner Badge:** Highlight the winning option that reached >50% majority.
- **Elimination Rounds Breakdown:** Step-by-step table or flow diagram showing:
    - Round 1 first-preference shares.
    - Successive rounds showing candidate eliminations and vote re-distributions until a majority winner is reached.
If Algorithm is `borda` (Borda Count):
- **Final Ranking List:** Ranked options ordered by total accumulated points.
- Displayed for each choice: **Total Borda Points** and **% Share of Total Points**.

Preference Distribution Matrix Box
- Heatmap or stacked bar chart showing how often each choice was placed at 1st rank, 2nd rank, 3rd rank, etc.

Demographic Breakdown Box:
- Same structure as One-Choice Polls (Age, Gender, Income, Geography).
- Displays first-preference or score distribution filtered by demographic segment.

## Live poll

User can create a live-poll to share with a live audience.  
The use case is for live or streamed events, such as conferences and public speeches.  

The flow is for the creator:
- User clicks on the quick-action **Create live poll**
- The live poll page is opened displaying a QR code always visible in the top-right position
- QR code is shared
- creator provides the question and the options, clicks "Open votations"
- a bar displaying the % of voters who have the live poll page opened and voted is shown (real-time updated)
- a button to close the votation is displayed

When the creator closes the live votation, the results are displayed with the following information:
- The demographic breakdown goes inside an expandable panel under each voting option.  
- For gender, use a single horizontal bar divided into two sections: light blue for men and pink for women, with the percentage written inside each segment.  
- For age, use a horizontal stacked bar chart. Age groups are ordered from the youngest at the top to the oldest at the bottom. Each bar represents an age group and is split internally into light blue and pink segments withtheir respective percentages.
- For income, use the same horizontal stacked bar chart. Income brackets are ordered from the lowest income at the top to the highest at the bottom. Each bar is split between light blue and pink with percentage values shown.  
- For geography, use a simple horizontal bar chart ordered from the city with the most votes at the top down to the lowest. Display only the top ten cities and add a final bar labeled other cities to collect all remaining votes.  

Below the QR code, a number showing the total count of voters who have the live poll page opened is displayed in the form "live / total for the plan".
When the live users exceed the allowed quota for the creator's plan, a button is displayed to the creator to go to subscriptions page and upgrade his plan.  

The flow for the voter is:
- QR code is scanned
- The live poll page is opened
- User provides, if not already registered, gender, birth date, income, city, country
- If the creator didn't opened the votation yet, then an animated svg asking to wait for the creator to open the votation is displayed
- If the creator opened the votation, then the user is displayed the current question with available choices
- After the voter submits the choice, a "thank you" is display

If the user joining the live poll is exceeding the allowed quota for the creator's plan, a message is displayed telling the user "Waiting the creator to increase the poll audience..."

UI for the voter is always mobile.

## Profile

If the user is registered and logged-in, the top-right "Register" button is replaced with "Full name".

Hovering or tapping the profile triggers a dropdown with:
- Polls
- Groups
- Profile
- Settings
- Logout

Settings page provides the option to change email and/or password.

Profile page provides a form with user information read-only, where nothing can be changed after registration.  
Below his info, his current active plan with the limits, and the option to downgrade/upgrade his plan to any other one.

The groups page provides two tabs: 
- the groups he belongs to
- the groups he manages
At the center of the tab content, there's the option to upgrade plan if the user is on the free plan.

The groups page provides two tabs:
- the list of polls the user created
- the list of polls the user voted

The user has a public link he can share bringing to his creator page.  
The user's creator page has his last name hidden and replaced with the first letter (e.g., John D.).
In the creator's page there are 2 main tabs, the open polls (if visible to the user), and the closed polls (if visible to the user). 

## Technical details

Use react-i18n to localize the app.
Use recharts for charts.
