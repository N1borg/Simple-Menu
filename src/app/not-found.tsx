// src/app/not-found.tsx
import Link from 'next/link';
import { FaGlassMartiniAlt, FaUtensils, FaHome } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-8 text-amber-900">
      <div className="max-w-2xl w-full text-center bg-white/80 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-amber-200">
        {/* En-tête */}
        <div className="bg-amber-800 p-6 text-amber-50">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <FaGlassMartiniAlt className="text-amber-300" />
            404 - Page Introuvable
            <FaUtensils className="text-amber-300" />
          </h1>
          <p className="mt-2 text-amber-200">Oups ! Cette table est déjà réservée...</p>
        </div>

        {/* Contenu */}
        <div className="p-8">
          <div className="mb-8">
            <div className="relative h-48 w-full mb-6">
              <div className="absolute inset-0 bg-amber-100 rounded-lg flex items-center justify-center">
                <div className="text-amber-800 text-9xl animate-bounce">404</div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg transform rotate-3">
                Plat Indisponible
              </div>
            </div>

            <p className="text-lg mb-6">
              La page que vous cherchez semble avoir quitté la cuisine. Peut-être que le chef est en pause
              ou que la recette a été égarée.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-amber-300/40"
            >
              <FaHome className="mr-2" />
              Retour à la salle principale
            </Link>

            <div className="text-sm text-amber-600 mt-6">
              <p>Vous cherchez toujours cette page ?</p>
              <p>Contactez notre maître d'hôtel au <span className="font-semibold">robin.caboche@epitech.eu</span></p>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="bg-amber-900/10 p-4 text-center text-amber-700 text-sm">
          © {new Date().getFullYear()} Simple Menu - Bon Appétit !
        </div>
      </div>
    </div>
  );
}
