'use client'

import Link from "next/link";
import { User, Loader2 } from "lucide-react";
import { useState } from "react";

interface AdminBannerProps {
  slug: string;
  isDashboard?: boolean;
  color?: string;
}

export default function AdminBanner({ slug, isDashboard = false, color = '#3a4fff' }: AdminBannerProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Determine link target and label
  const linkHref = isDashboard ? `/e/${slug}` : `/e/${slug}/admin`;
  const label = isDashboard
    ? (
      <>
        <span className="font-bold">Voir le menu</span>
        <span className="ml-2 hidden sm:inline font-normal" style={{ color: color + 'cc' }}>
          — Voir la page menu publique
        </span>
      </>
    )
    : (
      <>
        <span className="font-bold">Modifier le menu</span>
        <span className="ml-2 hidden sm:inline font-normal" style={{ color: color + 'cc' }}>
          — Passer en mode édition
        </span>
      </>
    );

  const handleClick = (e: React.MouseEvent) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }
    setIsLoading(true);
  };

  return (
    <Link
      href={linkHref}
      prefetch={false}
      onClick={handleClick}
      className={`tutorial-admin-banner w-full border-b shadow-sm py-2 px-0 flex justify-center items-center z-10 sticky top-0 left-0 transition-colors duration-200 focus:outline-none ${isLoading ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
      style={{ backgroundColor: `#f3f6fd`, borderColor: color + '40', color: color, letterSpacing: "0.02em" }}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" style={{ color }} />
      ) : (
        <User className="w-5 h-5 mr-2" style={{ color }} />
      )}
      <span>{label}</span>
    </Link>
  );
}
