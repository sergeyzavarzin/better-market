import { redirect } from "next/navigation";

export default async function ClearPage() {
  return redirect("/");
}
