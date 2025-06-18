'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="bg-[#f0f4ff] min-h-screen text-[#1e293b]">
      {/* HERO */}
      <section className="px-6 py-24 text-center max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-blue-600 mb-6">Simple Menu</h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8">
          Votre menu digital personnalisé, élégant et à jour en permanence.
          Gagnez du temps, améliorez l’expérience client, restez flexible à tout moment.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-4">
          <Link
            href="#contact"
            className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow hover:bg-blue-700 transition"
          >
            Demander une période d'essai
          </Link>
          <Link
            href="/demo"
            className="inline-block bg-white border border-blue-600 text-blue-600 font-semibold py-3 px-6 rounded-xl shadow hover:bg-blue-50 transition"
          >
            Voir un exemple de menu
          </Link>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Ce que Simple Menu peut faire pour vous</h2>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            <div className="p-6 rounded-lg border bg-[#f9fbff] shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-blue-600 mb-2">QR code unique</h3>
              <p>Un simple scan pour accéder à votre menu depuis n'importe quel smartphone.</p>
            </div>
            <div className="p-6 rounded-lg border bg-[#f9fbff] shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-blue-600 mb-2">Éditeur ultra-simple</h3>
              <p>Modifiez prix, produits, dispo et annonces en temps réel sans aucune compétence technique.</p>
            </div>
            <div className="p-6 rounded-lg border bg-[#f9fbff] shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-blue-600 mb-2">Personnalisation complète</h3>
              <p>Logo, couleurs, textes, happy hour, évènements : tout est fait à votre image.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section className="bg-[#e6eeff] py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Choisissez votre formule</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-blue-600 mb-2">Essentiel</h3>
              <p className="text-4xl font-extrabold text-blue-600 mb-2">6,99€ / mois</p>
              <ul className="text-sm text-gray-700 mb-6">
                <li>✅ Menu digital</li>
                <li>✅ QR code personnalisé</li>
                <li>✅ Accès administrateur</li>
                <li>✅ Design responsive</li>
              </ul>
              <Link
                href="#contact"
                className="block text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Je suis intéressé
              </Link>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-blue-600">
              <h3 className="text-xl font-bold text-blue-600 mb-2">Pro <div className="text-sm text-gray-500">Le plus populaire</div></h3>
              <p className="text-4xl font-extrabold text-blue-600 mb-2">12,99€ / mois</p>
              <ul className="text-sm text-gray-700 mb-6">
                <li>✅ Plan Essentiel inclus</li>
                <li>✅ Personnalisation avancée (logo, couleurs)</li>
                <li>✅ Nom de domaine personnalisé</li>
                <li>✅ Affichage des offres & stocks</li>
                <li>✅ Statistiques en temps réel</li>
                <li>✅ Support prioritaire</li>
              </ul>
              <Link
                href="#contact"
                className="block text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Je passe au Pro
              </Link>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-blue-600 mb-2">Premium</h3>
              <p className="text-4xl font-extrabold text-blue-600 mb-2">19,99€ / mois</p>
              <ul className="text-sm text-gray-700 mb-6">
                <li>✅ Plan Pro inclus</li>
                <li>✅ Pages événementielles personnalisées</li>
                <li>✅ Menu multilingue</li>
                <li>✅ Assistance créative (design, contenu)</li>
                <li>✅ Intégration avec outils de réservation</li>
                <li>✅ Gestion des avis clients</li>
                <li>✅ Formation à l'utilisation de la plateforme</li>
                <li>✅ Support téléphonique dédié</li>
                <li>✅ Gestion multi-établissements</li>
              </ul>
              <Link
                href="#contact"
                className="block text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Me faire une offre
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-4 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Des besoins plus spécifiques ?</h2>
          <p className="text-gray-700 mb-6">
            Tu cherches une fonctionnalité particulière ou un accompagnement sur-mesure ?
            <br />
            <a href="#contact" className="text-blue-600 hover:underline">Parlons-en directement.</a>
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 px-6 max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Prêt à digitaliser votre menu ?</h2>
        <p className="mb-4 text-gray-700">
          Je vous accompagne personnellement pour mettre en ligne un menu à votre image, en moins de 24h.
        </p>
        <a className="text-blue-600 font-semibold text-lg hover:underline" href="mailto:robin.caboche@epitech.eu">📩 robin.caboche@epitech.eu</a>
        <p className="mt-2">ou</p>
        <a
          href="https://wa.me/33637702875?text=Bonjour%20Robin,%20j'aimerais%20discuter%20de%20Simple%20Menu."
          target="_blank"
          className="inline-block mt-4 bg-blue-600 text-white py-3 px-6 rounded-xl shadow hover:bg-blue-700 transition"
        >
          Discuter sur WhatsApp
        </a>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-sm text-gray-500 py-6 border-t">
        © {new Date().getFullYear()} Simple Menu — Conçu avec passion à Lille 🧑‍🍳
      </footer>
    </main>
  )
}
