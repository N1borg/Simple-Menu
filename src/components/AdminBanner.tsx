import Link from "next/link";

interface AdminBannerProps {
  slug: string;
}

export default function AdminBanner({ slug }: AdminBannerProps) {
  return (
    <Link
      href={`/e/${slug}/admin`}
      className="block sticky top-0 z-50 bg-yellow-300 text-yellow-900 font-semibold text-center py-2 shadow hover:bg-yellow-400 transition-colors"
      prefetch={false}
    >
      Vous êtes connecté en tant qu’admin. Cliquez ici pour gérer le menu.
    </Link>
  );
}
