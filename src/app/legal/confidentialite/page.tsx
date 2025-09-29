export const metadata = {
  title: "Politique de Confidentialité | Simple-Menu",
  description: "Découvrez comment Simple-Menu protège vos données et respecte votre vie privée.",
};

import LegalHeader from "@/components/LegalHeader";
import LegalFooter from "@/components/LegalFooter";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <LegalHeader />

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-blue-700 mb-8">Politique de Confidentialité</h1>
          <div className="bg-white rounded-xl shadow p-6 text-gray-800">
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Responsable du traitement</h2>
            <p><span className="font-bold text-primary">Simple-Menu</span><br />Robin, micro-entrepreneur<br />Email : <a href="mailto:contact.simplemenu@gmail.com" className="text-primary underline">contact.simplemenu@gmail.com</a></p>
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Données collectées</h2>
            <h3 className="text-lg font-semibold mt-6 mb-2">2.1 Données d'inscription</h3>
            <ul className="list-disc ml-6 mb-2">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Nom de l'établissement</li>
              <li>Adresse de l'établissement</li>
            </ul>
            <h3 className="text-lg font-semibold mt-6 mb-2">2.2 Données de facturation</h3>
            <ul className="list-disc ml-6 mb-2">
              <li>Informations de paiement (traitées par Stripe)</li>
              <li>Adresse de facturation</li>
              <li>Historique des paiements</li>
            </ul>
            <h3 className="text-lg font-semibold mt-6 mb-2">2.3 Données d'utilisation</h3>
            <ul className="list-disc ml-6 mb-2">
              <li>Logs de connexion</li>
              <li>Statistiques d'utilisation</li>
              <li>Données techniques (IP, navigateur, device)</li>
            </ul>
            <h3 className="text-lg font-semibold mt-6 mb-2">2.4 Données de contenu</h3>
            <ul className="list-disc ml-6 mb-2">
              <li>Informations du menu (produits, prix, descriptions)</li>
              <li>Images uploadées</li>
              <li>Paramètres de personnalisation</li>
            </ul>
            <h2 className="text-xl font-semibold mt-8 mb-4">3. Finalités du traitement</h2>
            <ul className="list-disc ml-6 mb-2">
              <li>Fournir le service Simple-Menu</li>
              <li>Gérer les abonnements et la facturation</li>
              <li>Assurer le support client</li>
              <li>Améliorer nos services</li>
              <li>Respecter nos obligations légales</li>
            </ul>
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Base légale</h2>
            <ul className="list-disc ml-6 mb-2">
              <li>L'exécution du contrat (Article 6.1.b RGPD)</li>
              <li>L'intérêt légitime (Article 6.1.f RGPD)</li>
              <li>Le consentement (Article 6.1.a RGPD) pour les cookies non essentiels</li>
            </ul>
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Destinataires des données</h2>
            <h3 className="text-lg font-semibold mt-6 mb-2">5.1 Sous-traitants</h3>
            <ul className="list-disc ml-6 mb-2">
              <li><span className="font-bold">Stripe</span> (paiements) - États-Unis</li>
              <li><span className="font-bold">Vercel</span> (hébergement web) - États-Unis</li>
            </ul>
            <h3 className="text-lg font-semibold mt-6 mb-2">5.2 Transferts internationaux</h3>
            <p>Les données peuvent être transférées hors UE vers des pays disposant d'une décision d'adéquation ou avec les garanties appropriées (clauses contractuelles types).</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Durée de conservation</h2>
            <ul className="list-disc ml-6 mb-2">
              <li><span className="font-bold">Données client actif</span> : Durée de l'abonnement + 3 ans</li>
              <li><span className="font-bold">Données de facturation</span> : 10 ans (obligation légale)</li>
              <li><span className="font-bold">Logs techniques</span> : 12 mois</li>
              <li><span className="font-bold">Données de contenu</span> : Jusqu'à suppression par le client</li>
            </ul>
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Vos droits</h2>
            <ul className="list-disc ml-6 mb-2">
              <li>Droit d'accès</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement</li>
              <li>Droit à la limitation</li>
              <li>Droit à la portabilité</li>
              <li>Droit d'opposition</li>
            </ul>
            <p>Pour exercer vos droits, contactez-nous à : <a href="mailto:contact.simplemenu@gmail.com" className="text-primary underline">contact.simplemenu@gmail.com</a></p>
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Sécurité des données</h2>
            <ul className="list-disc ml-6 mb-2">
              <li>Chiffrement des données sensibles</li>
              <li>Accès restreint aux données</li>
              <li>Sauvegarde régulière</li>
              <li>Surveillance des accès</li>
            </ul>
            <h2 className="text-xl font-semibold mt-8 mb-4">9. Cookies</h2>
            <h3 className="text-lg font-semibold mt-6 mb-2">9.1 Cookies essentiels</h3>
            <ul className="list-disc ml-6 mb-2">
              <li>Cookies de session</li>
              <li>Cookies d'authentification</li>
              <li>Cookies de préférence</li>
            </ul>
            <h3 className="text-lg font-semibold mt-6 mb-2">9.2 Cookies analytiques</h3>
            <ul className="list-disc ml-6 mb-2">
              <li>Vercel Analytics (données anonymisées)</li>
            </ul>
            <h3 className="text-lg font-semibold mt-6 mb-2">9.3 Gestion des cookies</h3>
            <p>Vous pouvez paramétrer vos préférences cookies via notre bandeau de consentement.</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">10. Données des utilisateurs finaux</h2>
            <p>Simple-Menu ne collecte pas directement les données des clients de nos utilisateurs (visiteurs des menus). Les statistiques sont anonymisées.</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">11. Violations de données</h2>
            <ul className="list-disc ml-6 mb-2">
              <li>Notifier la CNIL sous 72h si nécessaire</li>
              <li>Vous informer si le risque est élevé</li>
              <li>Documenter l'incident</li>
            </ul>
            <h2 className="text-xl font-semibold mt-8 mb-4">12. Réclamations</h2>
            <p>Vous avez le droit d'introduire une réclamation auprès de la CNIL :</p>
            <ul className="list-disc ml-6 mb-2">
              <li><span className="font-bold">Site web</span> : <a href="https://www.cnil.fr" className="text-primary underline">https://www.cnil.fr</a></li>
              <li><span className="font-bold">Adresse</span> : 3 Place de Fontenoy, 75007 Paris</li>
              <li><span className="font-bold">Téléphone</span> : 01 53 73 22 22</li>
            </ul>
            <h2 className="text-xl font-semibold mt-8 mb-4">13. Modifications</h2>
            <p>Cette politique peut être modifiée. Nous vous informerons de tout changement significatif par email.</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">14. Contact</h2>
            <p>Pour toute question relative à cette politique : <a href="mailto:contact.simplemenu@gmail.com" className="text-primary underline">contact.simplemenu@gmail.com</a></p>
            <hr className="my-8" />
            <p className="text-sm text-gray-500"><em>Dernière mise à jour : 18/07/2025</em></p>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
