import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface ConfirmDeleteDialogProps {
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  triggerButtonClassName?: string;
  disabled?: boolean;
  loading?: boolean;
}

const ConfirmDeleteDialog = ({
  onConfirm,
  title = "Supprimer ?",
  description = "Cette action est irréversible. Voulez-vous vraiment continuer ?",
  confirmLabel = "Supprimer",
  cancelLabel = "Annuler",
  triggerButtonClassName = "mr-auto flex items-center justify-center",
  disabled = false,
  loading = false,
}: ConfirmDeleteDialogProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          className={`${triggerButtonClassName} w-9 h-9 cursor-pointer`}
          aria-label="Supprimer"
          disabled={disabled}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
            <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="cursor-pointer"
            >
            {cancelLabel}
            </Button>
            <Button
            variant="destructive"
            onClick={() => {
              setOpen(false);
              onConfirm();
            }}
            className="cursor-pointer"
            disabled={disabled}
            >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
