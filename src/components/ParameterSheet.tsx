import React, { useState } from "react";
import { Button } from "@/components/ui/button"
import AdminPasswordForm from "@/components/AdminPasswordForm";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Loader2Icon } from "lucide-react";
import QrCodeDialog from "@/components/QrCodeDialog";
import { LogOut, Trash2, Download, Settings } from "lucide-react";

interface ParameterSheetProps {
  establishment: {
    id: string;
    slug: string;
  };
  isDemo: boolean;
}

const ParameterSheet: React.FC<ParameterSheetProps> = ({ establishment, isDemo }) => {
  const [loggingOut, setLoggingOut] = useState(false);

  // Compute the public menu URL safely (SSR compatible)
  const publicMenuUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/e/${establishment.slug}`
    : `/e/${establishment.slug}`;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
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
            <QrCodeDialog url={publicMenuUrl} />
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
        <SheetFooter className="mt-4">
          <Button
            type="button"
            variant="destructive"
            className="w-full flex items-center gap-2"
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ParameterSheet;
