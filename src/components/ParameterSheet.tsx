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

interface ParameterSheetProps {
  establishment: {
    id: string;
    slug: string;
  };
  isDemo: boolean;
}

const ParameterSheet: React.FC<ParameterSheetProps> = ({ establishment, isDemo }) => {
  const [loggingOut, setLoggingOut] = useState(false);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">Paramètres</Button>
      </SheetTrigger>
      <SheetContent side="right" className="max-w-md w-full">
        <SheetHeader>
            <SheetTitle>Paramètres administrateur</SheetTitle>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-1">
          <div>
            <Label className="text-md gap-1.5 px-4 pt-4 pb-2 block">Changer de mot de passe</Label>
            <AdminPasswordForm
              establishmentId={establishment.id}
              slug={establishment.slug}
              isDemo={isDemo}
            />
          </div>
          <div className="px-4">
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              disabled={loggingOut}
              onClick={async () => {
                setLoggingOut(true);
                // Call the API first to clear the cookie server-side
                await fetch("/api/admin/logout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ slug: establishment.slug })
                });
                // Then clear the cookie client-side for instant effect
                document.cookie = "admin-session=; path=/; max-age=0;";
                window.location.href = `/e/${establishment.slug}/admin`;
              }}
            >
              {loggingOut ? (
                <span className="flex items-center gap-2"><Loader2Icon className="animate-spin" /> Déconnexion...</span>
              ) : (
                "Se déconnecter"
              )}
            </Button>
          </div>
        </div>
        <SheetFooter className="mt-4">
          <SheetClose asChild>
            <Button variant="outline" type="button">Fermer</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ParameterSheet;
