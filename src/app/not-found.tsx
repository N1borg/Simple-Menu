import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bg-[#f0f4ff] min-h-screen flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center border">
        <h1 className="text-6xl font-extrabold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Oups, page introuvable !</h2>
        <p className="text-gray-600 mb-6">
          La page que vous cherchez n’existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow hover:bg-blue-700 transition"
        >
          Retour à l’accueil
        </Link>
      </div>
      <footer className="mt-10 text-center text-sm text-gray-500">
        © 2025 Simple Menu — Conçu avec passion à Lille 🧑‍🍳
      </footer>
    </main>
  );
}
