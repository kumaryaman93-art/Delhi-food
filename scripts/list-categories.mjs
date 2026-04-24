import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(resolve(__dirname, "../.env.local"), "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) { const k = m[1].trim(); env[k] = m[2].trim().replace(/^"(.*)"$/, "$1").replace(/\\n/g, "\n"); }
}
initializeApp({ credential: cert({ projectId: env.FIREBASE_PROJECT_ID, clientEmail: env.FIREBASE_CLIENT_EMAIL, privateKey: env.FIREBASE_PRIVATE_KEY }) });
const s = await getFirestore().collection("categories").get();
s.docs.forEach((d) => console.log(d.data().name));
process.exit(0);
