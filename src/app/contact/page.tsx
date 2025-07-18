export const metadata = {
  title: "Contact | Simple-Menu",
  description: "Contactez Simple-Menu pour toute question ou demande. Nous adorons recevoir vos messages !",
};
import Link from "next/link";
import { Mail, Phone, MapPin, Smile } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-blue-700 font-extrabold text-xl">
            <img src="/simple-menu-logo-no-text.png" alt="Simple-Menu" className="h-8 w-8 rounded-full border-2 border-blue-200 shadow" />
            Simple-Menu
          </Link>
          <nav className="flex gap-6">
            <Link href="/" className="text-gray-700 hover:text-blue-700 font-medium">Accueil</Link>
            <Link href="/contact" className="text-blue-700 font-bold">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-100 relative">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-700 text-white px-6 py-2 rounded-full text-lg font-bold shadow-lg flex items-center gap-2">
              <Smile className="w-6 h-6" /> Contactez Simple-Menu
            </div>
            <h1 className="text-3xl font-extrabold text-blue-700 mb-6 text-center drop-shadow">Un menu de contact fun & efficace !</h1>
            <div className="flex flex-col items-center gap-3 mb-8">
              <Mail className="w-8 h-8 text-blue-600" />
              <span className="font-bold text-blue-700">Email</span>
              <a href="mailto:contact.simplemenu@gmail.com" className="text-blue-600 underline text-lg">contact.simplemenu@gmail.com</a>
            </div>
            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-xl text-center mb-4">
              <p className="text-green-800 font-semibold mb-2">🎉 On adore recevoir vos messages !</p>
              <p className="text-gray-700">Que ce soit pour un conseil, une question, ou juste pour dire bonjour, n'hésitez pas à nous écrire !</p>
            </div>
            <div className="flex flex-col gap-4 mt-6">
              <a 
                href="mailto:contact.simplemenu@gmail.com?subject=Contact%20depuis%20le%20menu&body=Bonjour%20Simple-Menu,%20j'ai%20une%20question%20!"
                className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-lg"
              >
                <Mail className="w-5 h-5" /> Envoyer un email
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - match home page style */}
      <footer className="text-center text-sm text-gray-500 py-6 border-t bg-white mt-10">
        © {new Date().getFullYear()} Simple-Menu — Conçu avec passion 🧑‍🍳
      </footer>
    </div>
  );
}
