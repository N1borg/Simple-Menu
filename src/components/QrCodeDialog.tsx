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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Download, Globe, Settings, Palette, Image } from "lucide-react";
import { ColorPicker, useColor } from 'react-color-palette'
import 'react-color-palette/css'

interface QrCodeDialogProps {
  url: string;
  adminUrl?: string;
  triggerButton?: React.ReactNode;
  establishmentColor?: string;
  logoUrl?: string;
}

const QrCodeDialog = ({ url, adminUrl, triggerButton, establishmentColor, logoUrl }: QrCodeDialogProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedType, setSelectedType] = useState<string>("public");
  const [selectedColorType, setSelectedColorType] = useState<string>("black");
  const [customColor, setCustomColor] = useColor("#000000");
  const [selectedStyle, setSelectedStyle] = useState<string>("classic");
  const [showLogo, setShowLogo] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [hexInput, setHexInput] = useState<string>("#000000");
  
  // Function to handle hex color input
  const handleHexInputChange = (value: string) => {
    setHexInput(value);
    // Validate hex color format
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(value)) {
      setCustomColor({ hex: value, rgb: hexToRgb(value), hsv: hexToHsv(value) });
    }
  };
  
  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 1
    } : { r: 0, g: 0, b: 0, a: 1 };
  };
  
  // Helper function to convert hex to HSV
  const hexToHsv = (hex: string) => {
    const rgb = hexToRgb(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6;
      else if (max === g) h = (b - r) / diff + 2;
      else h = (r - g) / diff + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    
    const s = max === 0 ? 0 : Math.round((diff / max) * 100);
    const v = Math.round(max * 100);
    
    return { h, s, v, a: 1 };
  };
  
  // Determine which URL to use based on selection
  const currentUrl = selectedType === "admin" && adminUrl ? adminUrl : url;
  
  // Determine QR code color
  const getQrColor = () => {
    switch (selectedColorType) {
      case "establishment":
        return establishmentColor || "#000000";
      case "custom":
        return customColor.hex;
      case "black":
      default:
        return "#000000";
    }
  };
  
  // QR Code styles/frames
  const qrStyles = [
    { 
      id: "classic", 
      name: "Classique", 
      description: "Style standard simple",
      borderRadius: 0,
      frame: false
    },
    { 
      id: "rounded", 
      name: "Arrondi", 
      description: "Coins arrondis modernes",
      borderRadius: 8,
      frame: false
    },
    { 
      id: "framed", 
      name: "Encadré", 
      description: "Avec bordure élégante",
      borderRadius: 4,
      frame: true
    },
    { 
      id: "gradient", 
      name: "Dégradé", 
      description: "Effet de dégradé stylé",
      borderRadius: 8,
      frame: true,
      gradient: true
    }
  ];

  // Check if QR code is likely to be scannable with logo
  const getQrCodeCompatibility = () => {
    if (!showLogo || !logoUrl) return { level: "optimal", message: "" };
    
    const urlLength = currentUrl.length;
    if (urlLength > 100) {
      return { 
        level: "warning", 
        message: "URL longue + logo : la lecture pourrait être difficile sur certains appareils" 
      };
    } else if (urlLength > 50) {
      return { 
        level: "caution", 
        message: "Testez la lecture du QR code sur différents appareils" 
      };
    }
    return { level: "optimal", message: "" }; // Remove "good" message
  };

  const compatibility = getQrCodeCompatibility();

  const handleDownload = async () => {
    setIsDownloading(true);
    
    const svg = svgRef.current;
    if (!svg) {
      setIsDownloading(false);
      return;
    }
    
    // Get the container with the styled QR code
    const container = svg.parentElement;
    if (!container) return;
    
    // Create a larger canvas for high quality output
    const canvas = document.createElement('canvas');
    const scale = 4; // Higher resolution
    const size = 240 * scale; // Base size * scale
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // Get current style
    const currentStyle = qrStyles.find(s => s.id === selectedStyle);
    const qrColor = getQrColor();
    
    // Draw frame if needed
    if (currentStyle?.frame) {
      const padding = 20 * scale;
      const borderWidth = 4 * scale;
      
      if (currentStyle.gradient) {
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, qrColor);
        gradient.addColorStop(1, qrColor + '80'); // Add transparency
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = qrColor;
      }
      
      // Draw frame
      if (currentStyle.borderRadius > 0) {
        const radius = currentStyle.borderRadius * scale;
        ctx.beginPath();
        ctx.roundRect(padding, padding, size - 2 * padding, size - 2 * padding, radius);
        ctx.fill();
        
        // Inner white area
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(padding + borderWidth, padding + borderWidth, 
                     size - 2 * (padding + borderWidth), size - 2 * (padding + borderWidth), radius);
        ctx.fill();
      } else {
        ctx.fillRect(padding, padding, size - 2 * padding, size - 2 * padding);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(padding + borderWidth, padding + borderWidth,
                    size - 2 * (padding + borderWidth), size - 2 * (padding + borderWidth));
      }
    }
    
    // Convert SVG to image and draw on canvas
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
    const blobUrl = URL.createObjectURL(svgBlob);
    const image = new window.Image();
    
    image.onload = () => {
      const qrSize = 180 * scale;
      const qrX = (size - qrSize) / 2;
      const qrY = (size - qrSize) / 2;
      
      ctx.drawImage(image, qrX, qrY, qrSize, qrSize);
      
      // Draw logo if enabled and available
      if (showLogo && logoUrl) {
        const logoImg = new window.Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.onload = () => {
          // Use bigger logo size for better visibility
          const logoSize = 40 * scale;
          const logoX = (size - logoSize) / 2;
          const logoY = (size - logoSize) / 2;
          
          // Draw white background circle with thinner border for better contrast
          const bgRadius = (logoSize / 2) + (4 * scale);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, bgRadius, 0, 2 * Math.PI);
          ctx.fill();
          
          // Add subtle thinner border around logo background
          ctx.strokeStyle = '#e5e5e5';
          ctx.lineWidth = 0.5 * scale;
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, bgRadius, 0, 2 * Math.PI);
          ctx.stroke();
          
          // Draw logo with rounded (circular) clipping
          ctx.save();
          ctx.beginPath();
          const logoRadius = logoSize / 2;
          ctx.arc(size / 2, size / 2, logoRadius, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
          ctx.restore();
          
          // Download the final image
          downloadCanvas();
        };
        logoImg.onerror = () => {
          console.warn('Logo failed to load, downloading QR code without logo');
          downloadCanvas();
        };
        logoImg.src = logoUrl;
      } else {
        downloadCanvas();
      }
      
      URL.revokeObjectURL(blobUrl);
    };
    
    image.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      setIsDownloading(false);
    };
    image.src = blobUrl;
    
    function downloadCanvas() {
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `qr-code-${selectedStyle}.png`;
      a.click();
      setIsDownloading(false);
    }
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
      <DialogContent className="max-w-md w-full flex flex-col max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>QR Code personnalisé</DialogTitle>
          <DialogDescription>
            Personnalisez votre QR Code avec différents styles et couleurs.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6 p-2"
             style={{ 
               scrollbarWidth: 'thin',
               scrollbarColor: 'rgba(0,0,0,0.2) transparent'
             }}>
          {/* Toggle Group for selecting QR code type */}
          {adminUrl && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Type de QR Code</Label>
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
          
          {/* Style Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Style du QR Code</Label>
            <div className="grid grid-cols-2 gap-2">
              {qrStyles.map((style) => (
                <Button
                  key={style.id}
                  variant={selectedStyle === style.id ? "default" : "outline"}
                  className="h-auto p-3 flex flex-col items-start text-left"
                  onClick={() => setSelectedStyle(style.id)}
                  style={selectedStyle === style.id && establishmentColor ? { 
                    backgroundColor: establishmentColor, 
                    borderColor: establishmentColor 
                  } : {}}
                >
                  <span className="font-medium text-sm">{style.name}</span>
                  <span className="text-xs ">{style.description}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Color Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Couleur du QR Code</Label>
            <div className="space-y-3">
              <ToggleGroup 
                variant="outline"
                type="single" 
                value={selectedColorType} 
                onValueChange={(value: string) => {
                  setSelectedColorType(value);
                  setShowColorPicker(value === "custom");
                }}
                className="w-full"
              >
                <ToggleGroupItem value="black" aria-label="Noir" className="flex-1">
                  <div className="w-4 h-4 bg-black rounded mr-2"></div>
                  Noir
                </ToggleGroupItem>
                {establishmentColor && (
                  <ToggleGroupItem value="establishment" aria-label="Couleur établissement" className="flex-1">
                    <div 
                      className="w-4 h-4 rounded mr-2" 
                      style={{ backgroundColor: establishmentColor }}
                    ></div>
                    Établissement
                  </ToggleGroupItem>
                )}
                <ToggleGroupItem value="custom" aria-label="Personnalisé" className="flex-1">
                  <Palette className="h-4 w-4 mr-2" />
                  Personnalisé
                </ToggleGroupItem>
              </ToggleGroup>
              
              {showColorPicker && (
                <div className="border rounded-lg p-3 space-y-3">
                  <ColorPicker 
                    color={customColor} 
                    onChange={(color: any) => {
                      setCustomColor(color);
                      setHexInput(color.hex);
                    }} 
                    hideInput 
                  />
                  <div>
                    <Label htmlFor="hex-input" className="text-xs font-medium mb-1 block">HEX</Label>
                    <Input
                      id="hex-input"
                      value={hexInput}
                      onChange={(e) => handleHexInputChange(e.target.value)}
                      placeholder="#000000"
                      className="text-sm"
                      maxLength={7}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Logo Option */}
          {logoUrl && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Logo au centre</Label>
              <Button
                variant={showLogo ? "default" : "outline"}
                className="w-full flex items-center gap-2"
                onClick={() => setShowLogo(!showLogo)}
                style={showLogo && establishmentColor ? { 
                  backgroundColor: establishmentColor, 
                  borderColor: establishmentColor 
                } : {}}
              >
                <Image className="w-4 h-4" />
                {showLogo ? "Logo activé" : "Afficher le logo"}
              </Button>
            </div>
          )}
          
          {/* QR Code Preview */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Aperçu</Label>
            
            {/* Compatibility indicator */}
            {compatibility.message && (
              <div className={`mb-3 p-2 rounded-lg text-xs ${
                compatibility.level === "warning" 
                  ? "bg-red-50 text-red-700 border border-red-200" 
                  : compatibility.level === "caution"
                  ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}>
                <div className="flex items-center gap-1">
                  {compatibility.level === "warning" && "⚠️"}
                  {compatibility.level === "caution" && "💡"}
                  {compatibility.level === "good" && "✅"}
                  <span>{compatibility.message}</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-center">
              <div 
                className="relative inline-block"
                style={{
                  borderRadius: qrStyles.find(s => s.id === selectedStyle)?.borderRadius || 0,
                  padding: qrStyles.find(s => s.id === selectedStyle)?.frame ? '12px' : '0',
                  background: qrStyles.find(s => s.id === selectedStyle)?.frame ? 
                    qrStyles.find(s => s.id === selectedStyle)?.gradient ?
                      `linear-gradient(135deg, ${getQrColor()}, ${getQrColor()}80)` :
                      getQrColor() : 
                    'transparent'
                }}
              >
                <div 
                  className="relative bg-white"
                  style={{
                    borderRadius: qrStyles.find(s => s.id === selectedStyle)?.borderRadius ? 
                      Math.max(0, (qrStyles.find(s => s.id === selectedStyle)?.borderRadius || 0) - 4) : 0,
                    padding: qrStyles.find(s => s.id === selectedStyle)?.frame ? '8px' : '0'
                  }}
                >
                  <QRCodeSVG 
                    ref={svgRef} 
                    value={currentUrl} 
                    size={180} 
                    bgColor="#ffffff" 
                    fgColor={getQrColor()}
                    title="QR Code"
                    level={showLogo && logoUrl ? "H" : "M"} // High error correction only with logo
                    includeMargin={false}
                    // Remove logo from preview to avoid ugly square, keep only for download
                    imageSettings={undefined}
                  />
                  {/* Custom circular logo overlay for preview */}
                  {showLogo && logoUrl && (
                    <div 
                      className="absolute rounded-full overflow-hidden bg-white shadow-sm"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '52px',
                        height: '52px',
                        border: '2px solid #e5e5e5',
                        backgroundImage: `url(${logoUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center text-xs break-all text-muted-foreground mb-3">
            {currentUrl}
          </div>
          
          {/* Test QR Code tip */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">
              💡 Conseil : Testez toujours votre QR code avec logo sur plusieurs appareils
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex-shrink-0">
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            style={establishmentColor ? { 
              backgroundColor: establishmentColor, 
              borderColor: establishmentColor 
            } : {}}
          >
            <Download className="w-4 h-4 mr-2" /> 
            {isDownloading ? "Téléchargement..." : "Télécharger"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeDialog;
