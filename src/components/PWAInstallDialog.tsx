import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

function isIos() {
  if (typeof window === "undefined") return false;
  return (
    /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()) &&
    !window.matchMedia("(display-mode: standalone)").matches
  );
}

export function PWAInstallDialog() {
  const [showIos, setShowIos] = useState(false);
  const [showAndroid, setShowAndroid] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isIos()) {
      setShowIos(true);
      setOpen(true);
    } else {
      const handler = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowAndroid(true);
        setOpen(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowAndroid(false);
      setDeferredPrompt(null);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xs mx-auto text-center">
        <DialogHeader>
          <DialogTitle>Installer l’application</DialogTitle>
        </DialogHeader>
        {showIos ? (
          <DialogDescription>
            <div className="mb-2">Ouvrez le menu <span style={{fontSize: 18}}>⤴️</span> puis “Sur l’écran d’accueil”</div>
            <div className="text-xs opacity-80">Astuce : sur iPhone/iPad, utilisez Safari pour installer l’application</div>
          </DialogDescription>
        ) : showAndroid ? (
          <DialogDescription>
            <div className="mb-4">Ajoutez Simple Menu sur votre appareil pour une expérience optimale.</div>
            <Button onClick={handleInstall} className="w-full" variant="secondary">
              Installer sur cet appareil
            </Button>
          </DialogDescription>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
