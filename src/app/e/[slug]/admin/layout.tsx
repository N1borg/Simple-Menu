import type { Metadata } from "next";
import { getServerSupabase } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const supabase = await getServerSupabase();
  const { data: establishment } = await supabase
    .from('establishments')
    .select('name')
    .eq('slug', slug)
    .single();

  const name = establishment?.name || slug;

  return {
    title: `Admin - ${name} | Simple-Menu`,
    description: `Administration du menu digital de ${name} sur Simple-Menu.`,
    openGraph: {
      title: `Admin - ${name} | Simple-Menu`,
      description: `Administration du menu digital de ${name} sur Simple-Menu.`,
      url: `https://simple-menu.app/e/${slug}/admin`,
      siteName: "Simple-Menu",
      locale: "fr_FR",
      type: "website",
      images: [
        {
          url: "https://simple-menu.app/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Simple-Menu - Menu digital",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Admin - ${name} | Simple-Menu`,
      description: `Administration du menu digital de ${name} sur Simple-Menu.`,
      images: ["https://simple-menu.app/og-image.jpg"],
    },
    alternates: {
      canonical: `https://simple-menu.app/e/${slug}/admin`,
    },
  };
}
import React from "react";
import Head from "next/head";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  return (
    <>
      <Head>
        <link rel="manifest" href={`/e/${slug}/manifest.json`} />
      </Head>
      <div>
        {children}
      </div>
    </>
  );
}
