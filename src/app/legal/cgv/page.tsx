export const metadata = {
  title: "Conditions Générales de Vente | Simple-Menu",
  description: "Consultez les CGV de Simple-Menu, la solution digitale pour menus de restaurants et bars.",
};

import Link from "next/link";
import LegalHeader from "@/components/LegalHeader";
import LegalFooter from "@/components/LegalFooter";

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <LegalHeader />

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-blue-700 mb-8">Conditions Générales de Vente</h1>
          <div className="bg-white rounded-xl shadow p-6 text-gray-800">
            <h2 className="text-xl font-semibold mt-8 mb-4">Article 1 - Objet et champ d'application</h2>
            <p>Les présentes Conditions Générales de Vente (CGV) régissent l'utilisation du service Simple-Menu proposé par Robin, micro-entrepreneur.</p>
            <p>Simple-Menu est une plateforme SaaS permettant aux restaurants, bars et cafés de créer et gérer des menus numériques accessibles via QR Code.</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">Article 2 - Services proposés</h2>
            <h3 className="text-lg font-semibold mt-6 mb-2">2.1 Description du service</h3>
            <p>Simple-Menu propose trois formules d'abonnement :</p>
            <ul className="list-disc ml-6 mb-2">
              <li><span className="font-bold text-primary">Essentiel</span> : 6,99€/mois <span className="text-xs text-gray-500">(prix de lancement, 13,99€ prix normal)</span></li>
              <li><span className="font-bold text-primary">Pro</span> : 12,99€/mois <span className="text-xs text-gray-500">(prix de lancement, 25,99€ prix normal)</span></li>
              <li><span className="font-bold text-primary">Premium</span> : 19,99€/mois <span className="text-xs text-gray-500">(prix de lancement, 39,99€ prix normal)</span></li>
            </ul>
            <h3 className="text-lg font-semibold mt-6 mb-2">2.2 Fonctionnalités incluses</h3>
            <p>Chaque formule comprend :</p>
            <ul className="list-disc ml-6 mb-2">
              <li>Menu numérique responsive</li>
              <li>Interface d'administration</li>
              <li>QR codes personnalisés</li>
              <li>Modifications en temps réel</li>
              <li>Support technique</li>
            </ul>
            <p>Les fonctionnalités détaillées sont disponibles sur notre site web.</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">Article 3 - Commande et acceptation</h2>
            <h3 className="text-lg font-semibold mt-6 mb-2">3.1 Processus de commande</h3>
            <p>La commande s'effectue via notre plateforme en ligne. Le Client doit :</p>
            <ol className="list-decimal ml-6 mb-2">
              <li>Sélectionner sa formule d'abonnement</li>
              <li>Renseigner ses informations</li>
              <li>Accepter les présentes CGV</li>
              <li>Procéder au paiement via Stripe</li>
            </ol>
            <h3 className="text-lg font-semibold mt-6 mb-2">3.2 Confirmation de commande</h3>
            <p>Une confirmation de commande est envoyée par email après validation du paiement.</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">Article 4 - Prix et paiement</h2>
            <h3 className="text-lg font-semibold mt-6 mb-2">4.1 Prix</h3>
            <p>Les prix sont indiqués en euros TTC. En tant que micro-entrepreneur, nous bénéficions de la franchise en base de TVA.</p>
            <h3 className="text-lg font-semibold mt-6 mb-2">4.2 Offre de lancement</h3>
            <p><span className="font-bold text-primary">Offre temporaire :</span> 2 semaines gratuites + 50% de réduction sur les 3 premiers mois.</p>
            <h3 className="text-lg font-semibold mt-6 mb-2">4.3 Modalités de paiement</h3>
            <ul className="list-disc ml-6 mb-2">
              <li>Paiement mensuel par prélèvement automatique via Stripe</li>
              <li>Moyens de paiement acceptés : CB, Visa, MasterCard</li>
              <li>Facturation le jour de souscription puis tous les mois à la même date</li>
            </ul>
            <h3 className="text-lg font-semibold mt-6 mb-2">4.4 Défaut de paiement</h3>
            <p>En cas de défaut de paiement, le service sera suspendu après 7 jours de retard. Après 30 jours, le compte sera supprimé.</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">Article 5 - Durée et résiliation</h2>
            <h3 className="text-lg font-semibold mt-6 mb-2">5.1 Durée d'engagement</h3>
            <p>Les abonnements sont souscrits pour une durée indéterminée, sans engagement minimum.</p>
            <h3 className="text-lg font-semibold mt-6 mb-2">5.2 Résiliation</h3>
            <p>Le Client peut résilier à tout moment depuis son interface d'administration ou en nous contactant. La résiliation prend effet à la fin de la période de facturation en cours.</p>
            <h3 className="text-lg font-semibold mt-6 mb-2">5.3 Résiliation par Simple-Menu</h3>
            <p>Nous nous réservons le droit de résilier un abonnement en cas de :</p>
            <ul className="list-disc ml-6 mb-2">
              <li>Non-paiement</li>
              <li>Utilisation contraire aux présentes CGV</li>
              <li>Comportement abusif</li>
            </ul>
            <h2 className="text-xl font-semibold mt-8 mb-4">Article 6 - Droit de rétractation</h2>
            <p>Conformément au Code de la consommation, le Client dispose d'un délai de 14 jours pour exercer son droit de rétractation, sauf s'il a expressément demandé la fourniture immédiate du service.</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">Article 7 - Remboursement</h2>
            <h3 className="text-lg font-semibold mt-6 mb-2">7.1 Principe</h3>
            <p>Les sommes versées sont remboursées au prorata de la période non utilisée en cas de résiliation anticipée justifiée.</p>
            <h3 className="text-lg font-semibold mt-6 mb-2">7.2 Modalités</h3>
            <p>Les remboursements s'effectuent par le même moyen de paiement que l'achat initial, sous 14 jours.</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">Article 8 - Obligations du Client</h2>
            <p>Le Client s'engage à :</p>
            <ul className="list-disc ml-6 mb-2">
              <li>Fournir des informations exactes</li>
              <li>Utiliser le service conformément à sa destination</li>
              <li>Respecter les droits de propriété intellectuelle</li>
              <li>Ne pas perturber le fonctionnement du service</li>
            </ul>
            <h2 className="text-xl font-semibold mt-8 mb-4">Article 9 - Obligations de Simple-Menu</h2>
            <p>Nous nous engageons à :</p>
            <ul className="list-disc ml-6 mb-2">
              <li>Fournir le service avec diligence</li>
              <li>Assurer la disponibilité du service (objectif 99,5%)</li>
              <li>Maintenir la sécurité des données</li>
              <li>Fournir un support technique</li>
            </ul>
            <h2 className="text-xl font-semibold mt-8 mb-4">Article 10 - Données personnelles</h2>
            <p>Le traitement des données personnelles est régi par notre <Link href="/politique-confidentialite" className="text-primary underline">Politique de confidentialité</Link>, conforme au RGPD.</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">Article 11 - Propriété intellectuelle</h2>
            <p>Le Client conserve ses droits sur les contenus qu'il publie. Simple-Menu conserve ses droits sur la plateforme et les technologies utilisées.</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">Article 12 - Responsabilité</h2>
            <h3 className="text-lg font-semibold mt-6 mb-2">12.1 Limitation de responsabilité</h3>
            <p>Notre responsabilité est limitée au montant de l'abonnement annuel. Nous ne pouvons être tenus responsables des dommages indirects.</p>
            <h3 className="text-lg font-semibold mt-6 mb-2">12.2 Force majeure</h3>
            <p>Nous ne saurions être tenus responsables en cas de force majeure ou d'événements indépendants de notre volonté.</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">Article 13 - Litiges et médiation</h2>
            <h3 className="text-lg font-semibold mt-6 mb-2">13.1 Réclamations</h3>
            <p>Toute réclamation doit être adressée à : <a href="mailto:contact.simplemenu@gmail.com" className="text-primary underline">contact.simplemenu@gmail.com</a></p>
            <h3 className="text-lg font-semibold mt-6 mb-2">13.2 Médiation</h3>
            <p>En cas de litige, le Client peut saisir la médiation de la consommation.</p>
            <h3 className="text-lg font-semibold mt-6 mb-2">13.3 Juridiction compétente</h3>
            <p>Les présentes CGV sont soumises au droit français. Les tribunaux français sont seuls compétents.</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">Article 14 - Modification des CGV</h2>
            <p>Nous nous réservons le droit de modifier les présentes CGV. Les modifications entrent en vigueur après notification par email.</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">Article 15 - Contact</h2>
            <p><span className="font-bold text-primary">Simple-Menu</span><br />
              Email : <a href="mailto:contact.simplemenu@gmail.com" className="text-primary underline">contact.simplemenu@gmail.com</a>
            </p>
            <hr className="my-8" />
            <p className="text-sm text-gray-500"><em>Dernière mise à jour : 18/07/2025</em></p>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
