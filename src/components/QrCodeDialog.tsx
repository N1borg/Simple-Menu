import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";

interface QrCodeDialogProps {
  url: string;
}

const QrCodeDialog = ({ url }: QrCodeDialogProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

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
        <Button variant="outline" size="sm">Générer un QR Code</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs w-full flex flex-col items-center">
        <DialogHeader>
          <DialogTitle>QR Code pour le menu</DialogTitle>
          <DialogDescription>
            Scannez ou téléchargez ce QR Code pour accéder au menu public.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 flex justify-center">
          <QRCodeSVG ref={svgRef} value={url} size={180} bgColor="#fff" fgColor="#000" title="QR Code" />
        </div>
        <div className="text-center text-xs break-all mb-2">{url}</div>
        <DialogFooter>
          <Button
            type="button"
            className="w-full mt-2"
            onClick={handleDownload}
          >
            Télécharger le QR Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeDialog;
