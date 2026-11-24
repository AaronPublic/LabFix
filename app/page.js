// "/" sends users to the right place.
import { redirect } from "next/navigation";
import { ROLE_HOME } from "@/lib/constants";
import { getSession } from "@/lib/session";

export default async function Home() {
  const user = await getSession();
  redirect(user ? ROLE_HOME[user.role] || "/login" : "/login");
}
