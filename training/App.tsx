import { WeeklyPlanView } from "../shared/weekly-plan/WeeklyPlanView";
import { TRAINING_PLAN } from "./plan";

const CLUB_PLAN_URL =
  "https://docs.google.com/spreadsheets/d/1ymM5Mci6aOUXHF5jVVyKOlWowfYm9ISFwXCvPYOl5Ho/edit?gid=534939754#gid=534939754";

export default function TrainingApp() {
  return (
    <>
      <WeeklyPlanView plan={TRAINING_PLAN} cardsOnly />
      <p className="broader-view-note">
        Looking further ahead? This week's plan is the only view that reflects the current
        injury status — for next week, next month or the full year once you're back to full
        running, see the{" "}
        <a href={CLUB_PLAN_URL} target="_blank" rel="noreferrer">
          club training plan (Google Sheets)
        </a>
        .
      </p>
    </>
  );
}
