export const metadata = {
  title: "Mentions Légales | Simple-Menu",
  description: "Informations légales et coordonnées de Simple-Menu, solution SaaS pour restaurants et bars.",
};

import Link from "next/link";
import LegalHeader from "@/components/LegalHeader";
import LegalFooter from "@/components/LegalFooter";

export default function LegalNoticesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <LegalHeader />

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-blue-700 mb-8">Mentions Légales</h1>
          <div className="bg-white rounded-xl shadow p-6 text-gray-800">
            <h2 className="text-xl font-semibold mt-8 mb-4">Identification de l'entreprise</h2>
            <p><span className="font-bold">Dénomination sociale :</span> Simple-Menu<br /><span className="font-bold">Forme juridique :</span> Micro-entreprise (auto-entrepreneur)<br /><span className="font-bold">Numéro SIRET :</span> 92829739900018<br /><span className="font-bold">Code APE :</span> 9511Z<br /><span className="font-bold">Numéro de TVA intracommunautaire :</span> Non assujetti (franchise en base de TVA)</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">Coordonnées du responsable</h2>
            <p><span className="font-bold">Nom :</span> Robin<br /><span className="font-bold">Téléphone :</span> 06.37.70.28.75<br /><span className="font-bold">Email :</span> <a href="mailto:contact.simplemenu@gmail.com" className="text-primary underline">contact.simplemenu@gmail.com</a></p>
            <h2 className="text-xl font-semibold mt-8 mb-4">Directeur de publication</h2>
            <p><span className="font-bold">Nom :</span> Robin<br /><span className="font-bold">Qualité :</span> Gérant<br /><span className="font-bold">Email :</span> <a href="mailto:contact.simplemenu@gmail.com" className="text-primary underline">contact.simplemenu@gmail.com</a></p>
            <h2 className="text-xl font-semibold mt-8 mb-4">Hébergement</h2>
            <p><span className="font-bold">Hébergeur :</span> Vercel Inc.<br /><span className="font-bold">Adresse :</span> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis<br /><span className="font-bold">Site web :</span> <a href="https://vercel.com" className="text-primary underline">https://vercel.com</a></p>
            <p><span className="font-bold">Base de données :</span> Supabase, Inc.<br /><span className="font-bold">Adresse :</span> 970 Toa Payoh North #07-04, Singapore 318992<br /><span className="font-bold">Site web :</span> <a href="https://supabase.com" className="text-primary underline">https://supabase.com</a></p>
            <h2 className="text-xl font-semibold mt-8 mb-4">Propriété intellectuelle</h2>
            <p>Le site Simple-Menu et tous ses éléments (textes, images, logos, design) sont protégés par le droit d'auteur et sont la propriété exclusive de Simple-Menu, sauf mention contraire.</p>
            <p>Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">Données personnelles</h2>
            <p>Les données personnelles collectées sur ce site sont traitées conformément à notre <Link href="/legal/confidentialite" className="text-primary underline">Politique de confidentialité</Link> et au Règlement Général sur la Protection des Données (RGPD).</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">Responsabilité</h2>
            <p>Simple-Menu s'efforce de fournir des informations exactes et à jour. Cependant, nous ne pouvons garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.</p>
            <p>L'utilisation du service Simple-Menu se fait sous votre entière responsabilité.</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">Droit applicable</h2>
            <p>Les présentes mentions légales sont soumises au droit français. Tout litige sera soumis à la compétence exclusive des tribunaux français.</p>
            <h2 className="text-xl font-semibold mt-8 mb-4">Contact</h2>
            <p>Pour toute question concernant ces mentions légales : <a href="mailto:contact.simplemenu@gmail.com" className="text-primary underline">contact.simplemenu@gmail.com</a></p>
            <hr className="my-8" />
            <p className="text-sm text-gray-500"><em>Dernière mise à jour : 18/07/2025</em></p>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
