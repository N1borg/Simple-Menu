import Link from "next/link";

export default function LegalHeader() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-blue-700 font-extrabold text-xl">
          <img src="/simple-menu-logo-no-text.png" alt="Simple-Menu" className="h-8 w-8 rounded-full border-2 border-blue-200 shadow" />
          Simple-Menu
        </Link>
        <nav className="flex gap-6">
          <Link href="/" className="text-gray-700 hover:text-blue-700 font-medium">Accueil</Link>
          <Link href="/#contact" className="text-gray-700 hover:text-blue-700 font-medium">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
