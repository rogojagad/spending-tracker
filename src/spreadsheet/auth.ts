import { JWT } from "google-auth-library";

const email = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
const key = Deno.env.get("GOOGLE_PRIVATE_KEY")?.replace(
  /\\n/g,
  "\n",
);

if (!email?.length || !key?.length) {
  throw new Error("Google Service Account Email or Key Undefined");
}

const serviceAccountAuth = new JWT({
  email,
  key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export default serviceAccountAuth;
