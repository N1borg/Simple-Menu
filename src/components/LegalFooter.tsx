import Link from "next/link";

interface LegalFooterProps {
  transparentBg?: boolean;
}

export default function LegalFooter({ transparentBg = false }: LegalFooterProps) {
  return (
    <footer
      className={`text-center text-sm text-gray-500 py-6 border-t mt-10 ${
        transparentBg ? 'bg-transparent' : 'bg-white'
      }`}
    >
      © {new Date().getFullYear()} Simple-Menu — Conçu avec passion 🧑‍🍳<br />
      <span className="block mt-2">
        <Link href="/legal/mentions-legales" className="underline hover:text-blue-700">Mentions légales</Link>
        {" | "}
        <Link href="/legal/confidentialite" className="underline hover:text-blue-700">Confidentialité</Link>
        {" | "}
        <Link href="/legal/cgv" className="underline hover:text-blue-700">CGV</Link>
      </span>
    </footer>
  );
}
