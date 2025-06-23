import Link from "next/link";

interface AdminBannerProps {
  slug: string;
  isDashboard?: boolean;
}

export default function AdminBanner({ slug, isDashboard = false }: AdminBannerProps) {
  // Determine link target and label
  const linkHref = isDashboard ? `/e/${slug}` : `/e/${slug}/admin`;
  const label = isDashboard
    ? (
      <>
        <span className="font-bold">Mode gestion activé</span>
        <span className="ml-2 hidden sm:inline text-blue-600/80 font-normal">
          — Voir la page menu publique
        </span>
      </>
    )
    : (
      <>
        <span className="font-bold">Mode gestion activé</span>
        <span className="ml-2 hidden sm:inline text-blue-600/80 font-normal">
          — Passer en mode édition
        </span>
      </>
    );

  return (
    <div className="w-full bg-blue-50 border-b border-blue-200 shadow-sm py-2 px-0 flex justify-center items-center z-10 sticky top-0 left-0">
      <Link
        href={linkHref}
        prefetch={false}
        className="
          flex items-center gap-2
          text-blue-700 font-semibold text-base
          transition-colors duration-200
          hover:text-blue-900
          focus:outline-none
        "
        style={{ letterSpacing: "0.02em" }}
      >
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-2.663-5.33-4-8-4z" />
        </svg>
        <span>{label}</span>
      </Link>
    </div>
  );
}
