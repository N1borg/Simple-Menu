import React, { useState } from "react";
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import AdminPasswordForm from "@/components/AdminPasswordForm";
import ColorSelector from "@/components/ColorSelector";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { LogOut, Settings, Loader2, HelpCircle, Smartphone } from "lucide-react";
import QrCodeDialog from "@/components/QrCodeDialog";

interface ParameterSheetProps {
  establishment: {
    id: string;
    slug: string;
    primary_color?: string;
    plan?: string;
    logo_url?: string;
  };
  isDemo: boolean;
  subscription: any; // Add subscription prop
  onTutorialStart?: () => void;
}

const ParameterSheet: React.FC<ParameterSheetProps> = ({ establishment, isDemo, subscription, onTutorialStart }) => {
  const [loggingOut, setLoggingOut] = useState(false);
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(establishment.primary_color || '#3b82f6');
  const [isSavingColor, setIsSavingColor] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPWAInstall, setShowPWAInstall] = useState(false);

  // Check if PWA is allowed for this establishment
  const plan = establishment?.plan || 'essentiel';
  const isPwaAllowed = (plan === 'pro' || plan === 'premium') && !isDemo;

  React.useEffect(() => {
    if (!isPwaAllowed) return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPWAInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isPwaAllowed]);

  const handlePWAInstall = async () => {
    if (!deferredPrompt) {
      // For iOS or already installed
      toast.info("Sur iOS, utilisez Safari et cliquez sur 'Partager' puis 'Sur l'écran d'accueil'");
      return;
    }
    
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        toast.success("Application installée avec succès !");
        setShowPWAInstall(false);
        setDeferredPrompt(null);
      }
    } catch (error) {
      toast.error("Erreur lors de l'installation");
    }
  };

  const handleColorSave = async () => {
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).");
      return;
    }

    setIsSavingColor(true);
    try {
      const response = await fetch('/api/admin/update-color', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color: currentColor })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la couleur');
      }
      
      toast.success('Couleur mise à jour avec succès !');
      setColorDialogOpen(false);
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la couleur');
    } finally {
      setIsSavingColor(false);
    }
  };

  // Compute the public menu URL safely (SSR compatible)
  const publicMenuUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/e/${establishment.slug}`
    : `/e/${establishment.slug}`;
  
  // Compute the admin URL safely (SSR compatible)
  const adminUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/e/${establishment.slug}/admin`
    : `/e/${establishment.slug}/admin`;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="default" className="flex items-center gap-2 cursor-pointer">
          <Settings className="w-4 h-4" /> Paramètres
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="max-w-md w-full flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
            <SheetTitle>Paramètres administrateur</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto min-h-0 pb-4">
          <div className="grid auto-rows-min gap-6 px-1">
          
          {/* Subscription Plan Information */}
          {!isDemo && (
            <div className="px-4">
              <SubscriptionBanner 
                subscription={subscription} 
                className="mb-2"
                establishmentColor={establishment.primary_color}
              />
            </div>
          )}
          
          <div className="px-4 tutorial-color-settings">
            <Dialog open={colorDialogOpen} onOpenChange={setColorDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border"
                    style={{
                      backgroundColor: establishment.primary_color || '#3b82f6',
                      display: 'inline-block',
                    }}
                  />
                  Modifier la couleur
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Modifier la couleur principale</DialogTitle>
                </DialogHeader>
                <ColorSelector
                  currentColor={currentColor}
                  onColorChange={setCurrentColor}
                  establishmentId={establishment.id}
                  isDemo={isDemo}
                  showPreview={true}
                  showSaveButton={false}
                  title=""
                  description="Modifiez la couleur principale de votre établissement."
                  className="mt-2"
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <Button 
                    onClick={handleColorSave}
                    disabled={isSavingColor}
                  >
                    {isSavingColor ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                        Sauvegarde...
                      </div>
                    ) : (
                      'Enregistrer'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="px-4 tutorial-qr-code">
            {/* QR Code Button and Dialog */}
            <QrCodeDialog 
              url={publicMenuUrl} 
              adminUrl={adminUrl}
              establishmentColor={establishment.primary_color}
              logoUrl={establishment.logo_url}
            />
          </div>
          {isPwaAllowed && (
            <div className="px-4">
                <Button
                className="w-full flex items-center gap-2"
                onClick={handlePWAInstall}
                >
                <Smartphone className="w-4 h-4" />
                {showPWAInstall || !deferredPrompt 
                  ? "Installer l'application" 
                  : "Application disponible"
                }
                </Button>
            </div>
          )}
          <div className="tutorial-password-change">
            <Label className="text-md gap-1.5 px-4 pt-4 pb-2 block">Changer de mot de passe</Label>
            <AdminPasswordForm
              establishmentId={establishment.id}
              slug={establishment.slug}
              isDemo={isDemo}
              />
          </div>
          {onTutorialStart && (
            <div className="px-4">
              <Label className="text-md gap-1.5 px-4 pt-4 pb-2 block">Aide</Label>
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  onClick={() => {
                    onTutorialStart()
                  }}
                  >
                  <HelpCircle className="w-4 h-4" />
                  Relancer le tutoriel
                </Button>
              </SheetClose>
            </div>
          )}
          </div>
        </div>
        <SheetFooter className="flex-shrink-0 bg-background p-4 flex flex-col gap-2">
          <div className="tutorial-logout">
            <Button
              type="button"
              variant="destructive"
              className="w-full flex items-center gap-2 cursor-pointer"
              disabled={loggingOut}
              onClick={async () => {
                setLoggingOut(true);
                await fetch("/api/admin/logout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ slug: establishment.slug })
                });
                document.cookie = "admin-session=; path=/; max-age=0;";
                window.location.href = `/e/${establishment.slug}/admin`;
              }}
            >
              {loggingOut ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  Déconnexion...
                </div>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Se déconnecter
                </>
              )}
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center gap-2 cursor-pointer"
            onClick={() => {
              document.activeElement && (document.activeElement as HTMLElement).blur();
            }}
            asChild
          >
            <SheetClose asChild>
              <span className="flex items-center w-full justify-center" data-testid="sheet-close">
                Fermer
              </span>
            </SheetClose>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ParameterSheet;
