import { redirect } from "next/navigation";

interface LegacySharePageProps {
  params: Promise<{ token: string }>;
}

export default async function LegacySharedPhotoPage({ params }: LegacySharePageProps) {
  const { token } = await params;
  redirect(`/share/${encodeURIComponent(token)}`);
}
