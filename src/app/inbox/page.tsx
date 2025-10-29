// app/inbox/page.tsx (Server Component)
import { getConnectedFollowers } from "@/actions/user.action";
import ConnectedFollowers from "@/components/ConnectedFollowers";
export default async function InboxPage() {
  const users = await getConnectedFollowers();
  return <ConnectedFollowers initialUsers={users} />;
}
