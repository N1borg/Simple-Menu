import React, { useState } from "react";
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import AdminPasswordForm from "@/components/AdminPasswordForm";
import ColorSelector from "@/components/ColorSelector";
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
import { Loader2Icon } from "lucide-react";
import QrCodeDialog from "@/components/QrCodeDialog";
import { LogOut, Settings } from "lucide-react";

interface ParameterSheetProps {
  establishment: {
    id: string;
    slug: string;
    primary_color?: string;
  };
  isDemo: boolean;
}

const ParameterSheet: React.FC<ParameterSheetProps> = ({ establishment, isDemo }) => {
  const [loggingOut, setLoggingOut] = useState(false);
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(establishment.primary_color || '#3b82f6');
  const [isSavingColor, setIsSavingColor] = useState(false);

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
      console.error('Error saving color:', error);
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
      <SheetContent side="right" className="max-w-md w-full">
        <SheetHeader>
            <SheetTitle>Paramètres administrateur</SheetTitle>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-1 mt-6">
          <div className="px-4">
            {/* QR Code Button and Dialog */}
            <QrCodeDialog url={publicMenuUrl} adminUrl={adminUrl} />
          </div>
          <div className="px-4">
            <Label className="text-md gap-1.5 px-4 pt-4 pb-2 block">Couleur de l'établissement</Label>
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
                      <>
                        <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
                        Sauvegarde...
                      </>
                    ) : (
                      'Enregistrer'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div>
            <Label className="text-md gap-1.5 px-4 pt-4 pb-2 block">Changer de mot de passe</Label>
            <AdminPasswordForm
              establishmentId={establishment.id}
              slug={establishment.slug}
              isDemo={isDemo}
            />
          </div>
        </div>
        <SheetFooter className="mt-4 flex flex-col gap-2">
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
              <>
                <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
                Déconnexion...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                Se déconnecter
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center gap-2 cursor-pointer"
            onClick={() => {
              // Ferme le panneau
              document.activeElement && (document.activeElement as HTMLElement).blur();
            }}
            asChild
          >
            <SheetClose asChild>
              <span className="flex items-center w-full justify-center">
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
