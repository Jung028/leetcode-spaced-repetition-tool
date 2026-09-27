import { WeeklyPlanView } from "../shared/weekly-plan/WeeklyPlanView";
import { TRAINING_PLAN } from "./plan";

export default function TrainingApp() {
  return <WeeklyPlanView plan={TRAINING_PLAN} />;
}
