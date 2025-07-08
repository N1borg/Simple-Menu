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
