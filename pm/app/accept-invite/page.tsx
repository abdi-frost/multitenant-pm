import { redirect } from "next/navigation";

export default async function AcceptInviteRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (token) {
    redirect(`/accept-invitation/${encodeURIComponent(token)}`);
  }

  redirect("/auth/login");
}
