import { privacy } from "@/content/privacy";

/*
  Server-side switch for the consultation form (decision D-41). The form is live only when ALL of:
    1. CONSULT_ENABLED=true is set in the environment,
    2. RESEND_API_KEY is set,
    3. the privacy notice has been reviewed (privacy.reviewed in src/content/privacy.ts).
  The home page is built statically, so after changing environment variables redeploy.
  Do not import this file from client components.
*/
export function consultEnabled(): boolean {
  return (
    process.env.CONSULT_ENABLED === "true" &&
    Boolean(process.env.RESEND_API_KEY) &&
    privacy.reviewed
  );
}
