import React from "react";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href={`/e/${slug}/manifest.json`} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
