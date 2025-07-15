import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function isIos() {
  if (typeof window === "undefined") return false;
  return (
    /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()) &&
    !window.matchMedia("(display-mode: standalone)").matches
  );
}

interface PWAInstallBannerProps {
  establishment?: {
    plan?: string;
    slug?: string;
  };
}

export function PWAInstallBanner({ establishment }: PWAInstallBannerProps) {
  const [showIos, setShowIos] = useState(false);
  const [showAndroid, setShowAndroid] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Check if PWA is allowed for this establishment
  const plan = establishment?.plan || 'essentiel';
  const isDemo = establishment?.slug === 'demo';
  const isPwaAllowed = (plan === 'pro' || plan === 'premium') && !isDemo;

  useEffect(() => {
    if (!isPwaAllowed) {
      setShowIos(false);
      setShowAndroid(false);
      return;
    }

    if (isIos()) {
      setShowIos(true);
    } else {
      const handler = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowAndroid(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, [isPwaAllowed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowAndroid(false);
      setDeferredPrompt(null);
    }
  };

  if (!isPwaAllowed) {
    return null;
  }

  if (showIos) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-blue-700 text-white p-4 text-center z-50 shadow-lg flex flex-col items-center gap-2">
        <b>Installer l’application :</b> Ouvrez le menu <span style={{fontSize: 18}}>⤴️</span> puis “Sur l’écran d’accueil”
        <span className="text-xs opacity-80">Astuce : sur iPhone/iPad, utilisez Safari pour installer l’application</span>
      </div>
    );
  }

  if (showAndroid) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-blue-700 text-white p-4 text-center z-50 shadow-lg flex flex-col items-center gap-2">
        <b>Installer l’application Simple Menu ?</b>
        <Button onClick={handleInstall} className="mt-2 w-full max-w-xs mx-auto" variant="secondary">
          Installer sur cet appareil
        </Button>
      </div>
    );
  }

  return null;
}
