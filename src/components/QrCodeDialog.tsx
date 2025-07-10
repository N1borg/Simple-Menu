import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Download, Globe, Settings } from "lucide-react";

interface QrCodeDialogProps {
  url: string;
  adminUrl?: string;
  triggerButton?: React.ReactNode;
}

const QrCodeDialog = ({ url, adminUrl, triggerButton }: QrCodeDialogProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedType, setSelectedType] = useState<string>("public");
  
  // Determine which URL to use based on selection
  const currentUrl = selectedType === "admin" && adminUrl ? adminUrl : url;

  const handleDownload = () => {
    const svg = svgRef.current;
    if (!svg) return;
    // Convert SVG to PNG using a canvas
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
    const blobUrl = URL.createObjectURL(svgBlob);
    const image = new window.Image();
    image.onload = () => {
      const size = svg.width.baseVal.value || 180;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(image, 0, 0, size, size);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = 'qr-code.png';
        a.click();
      }
      URL.revokeObjectURL(blobUrl);
    };
    image.onerror = () => URL.revokeObjectURL(blobUrl);
    image.src = blobUrl;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {triggerButton ? triggerButton : (
          <Button variant="outline" className="w-full flex items-center gap-2">
            <QrCode className="w-4 h-4" /> Générer un QR Code
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xs w-full flex flex-col">
        <DialogHeader>
          <DialogTitle>QR Code pour le menu</DialogTitle>
          <DialogDescription>
            Choisissez le type de QR Code à générer et télécharger.
          </DialogDescription>
        </DialogHeader>
        
        {/* Toggle Group for selecting QR code type */}
        {adminUrl && (
          <div className="mb-4">
            <ToggleGroup 
              variant="outline"
              type="single" 
              value={selectedType} 
              onValueChange={(value: string) => setSelectedType(value)}
              className="w-full"
            >
              <ToggleGroupItem value="public" aria-label="Menu public" className="flex-1">
                <Globe className="h-4 w-4 mr-2" />
                Menu public
              </ToggleGroupItem>
              <ToggleGroupItem value="admin" aria-label="Administration" className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Administration
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}
        
        <div className="my-4 flex justify-center">
          <QRCodeSVG ref={svgRef} value={currentUrl} size={180} bgColor="#fff" fgColor="#000" title="QR Code" />
        </div>
        <div className="text-center text-xs break-all mb-2">{currentUrl}</div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" /> Télécharger le QR Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeDialog;
