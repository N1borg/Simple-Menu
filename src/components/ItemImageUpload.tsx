import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Pencil, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ConfirmDeleteDialog from '@/components/ui/ConfirmDeleteDialog';
import type { MenuItem } from '@/types/supabase_types';
import { getEstablishmentColor } from '@/lib/utils'
import ProCrown from '@/components/ui/ProCrown';
import UpgradeDialog from '@/components/ui/UpgradeDialog';

interface ItemImageUploadProps {
  item: MenuItem;
  plan: string;
  onImageUploaded: (url: string | null) => void;
  isDemo?: boolean;
  className?: string;
  color?: string;
}

interface UploadError {
  message: string;
  type: 'file' | 'network' | 'server';
}

export default function ItemImageUpload({
  item,
  plan = 'essentiel',
  onImageUploaded,
  isDemo = false,
  className = '',
  color,
}: ItemImageUploadProps) {
  const isProOrPremium = plan === 'pro' || plan === 'premium';
  const establishmentColor = getEstablishmentColor(color)
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<UploadError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayedImageUrl, setDisplayedImageUrl] = useState<string | undefined>(item.image_url || undefined);

  // State for upgrade dialog
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  useEffect(() => {
    setDisplayedImageUrl(item.image_url || undefined);
  }, [item.image_url]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'Format non supporté. Utilisez JPG, PNG, WebP ou GIF.';
    }
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return 'Fichier trop volumineux. Taille maximale: 50MB.';
    }
    return null;
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Impossible de lire le fichier'));
      reader.readAsDataURL(file);
    });
  };

  const uploadImage = async (file: File) => {
    clearMessages();
    setIsUploading(true);
    try {
      const validationError = validateFile(file);
      if (validationError) {
        setError({ message: validationError, type: 'file' });
        return;
      }
      const base64 = await convertToBase64(file);
      // POST to backend API that uploads to Cloudinary
      const response = await fetch('/api/admin/menu-item/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: base64,
          item_id: item.id,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        let errorType: UploadError['type'] = 'server';
        if (response.status === 413) {
          errorType = 'file';
        } else if (response.status >= 500) {
          errorType = 'server';
        }
        setError({
          message: data.error || 'Erreur lors de l\'upload',
          type: errorType,
        });
        toast.error(data.error || 'Erreur lors de l\'upload');
        return;
      }
      // Now update the item's image_url in Supabase
      const updateRes = await fetch('/api/admin/menu-item/update-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, image_url: data.url }),
      });
      const updateData = await updateRes.json();
      if (!updateRes.ok) {
        setError({ message: updateData.error || "Erreur lors de la mise à jour de l'image", type: 'server' });
        toast.error(updateData.error || "Erreur lors de la mise à jour de l'image");
        return;
      }
      setSuccess('Image optimisée et uploadée avec succès!');
      toast.success('Image de l\'article mise à jour !');
      setDisplayedImageUrl(data.url);
      onImageUploaded(data.url);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError({
        message: 'Erreur de connexion. Vérifiez votre connexion internet.',
        type: 'network',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    uploadImage(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Banner/rectangle image or upload area */}
      {isDemo ? (
        <div className="relative w-full mb-4">
          <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 text-center min-h-[140px] bg-blue-50 w-full" style={{ height: '140px', color: establishmentColor }}>
            Vous changez l'image ici
          </div>
        </div>
      ) : displayedImageUrl ? (
        <div className="relative w-full mb-4">
          <div className="relative">
            <Image
              src={displayedImageUrl}
              alt="Image de l'article"
              width={600}
              height={180}
              className={`w-full h-36 object-cover bg-white rounded-lg border border-gray-200 transition-opacity duration-200 ${isUploading ? 'opacity-50 grayscale pointer-events-none' : ''}`}
              priority
              quality={90}
              sizes="100vw"
            />
            {/* Overlay loader when uploading */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
              </div>
            )}
            <div className="absolute top-2 right-2 flex gap-2 z-20">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="opacity-70 hover:opacity-100 cursor-pointer"
                    title="Modifier"
                    onClick={() => {
                      if (!isProOrPremium) {
                        setUpgradeDialogOpen(true)
                      } else {
                        fileInputRef.current?.click()
                      }
                    }}
                    disabled={isUploading || isDemo}
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                      !isProOrPremium ? (
                        <ProCrown className="w-5 h-5 text-yellow-500" title="Fonctionnalité Pro/Premium" />
                      ) : (
                        <Pencil className="w-4 h-4" />
                      )
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {!isProOrPremium ? (
                    <span>
                      <span className="text-yellow-500 font-semibold">Fonctionnalité Premium</span><br/>
                      Cliquer pour découvrir les plans et ajouter des images à vos articles.
                    </span>
                  ) : (
                    <p>Modifier l'image</p>
                  )}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <ConfirmDeleteDialog
                      onConfirm={async () => {
                        if (isDemo || !isProOrPremium) {
                          toast.info(!isProOrPremium ? 'Fonctionnalité réservée aux plans Pro/Premium.' : 'Modification désactivée (mode démo).');
                          return;
                        }
                        const previousImageUrl = displayedImageUrl;
                        setDisplayedImageUrl(undefined); // Immediately remove image from UI
                        let apiSuccess = false;
                        try {
                          const res = await fetch('/api/admin/menu-item/delete-image', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ item_id: item.id }),
                          });
                          const data = await res.json();
                          if (res.ok && data.success) {
                            // Also update the item's image_url in Supabase to null
                            await fetch('/api/admin/menu-item/update-image', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: item.id, image_url: null }),
                            });
                            apiSuccess = true;
                            onImageUploaded(null);
                            toast.success("Image supprimée !");
                          } else {
                            setError({ message: data.error || "Erreur lors de la suppression de l'image", type: 'server' });
                            toast.error(data.error || "Erreur lors de la suppression de l'image");
                          }
                        } catch (err) {
                          setError({ message: "Erreur réseau lors de la suppression de l'image", type: 'network' });
                          toast.error("Erreur réseau lors de la suppression de l'image");
                        }
                        if (!apiSuccess) {
                          setDisplayedImageUrl(previousImageUrl); // Restore image if API call failed
                        }
                      }}
                      title="Confirmer la suppression"
                      description={!isProOrPremium ? 'Fonctionnalité réservée aux plans Pro/Premium.' : "Cette action supprimera l'image de l'article. Voulez-vous continuer ?"}
                      disabled={isUploading || isDemo || !isProOrPremium}
                      loading={isUploading}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {!isProOrPremium ? (
                    <span>
                      <span className="text-yellow-500 font-semibold">Fonctionnalité Pro</span><br/>
                      Ajoutez une image à vos articles en passant au plan <span className="font-semibold">Pro</span> ou <span className="font-semibold">Premium</span>.
                    </span>
                  ) : (
                    <p>Supprimer l'image</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleInputChange}
            className="hidden"
            disabled={isUploading || isDemo || !isProOrPremium}
          />
        </div>
      ) : (
        <div>
          <div
            className="relative w-full h-36 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg cursor-pointer mb-4 transition-colors"
            onClick={() => {
              if (!isDemo) {
                if (!isProOrPremium) {
                  setUpgradeDialogOpen(true)
                } else {
                  fileInputRef.current?.click()
                }
              }
            }}
            onDrop={isDemo || !isProOrPremium ? undefined : handleDrop}
            onDragOver={isDemo || !isProOrPremium ? undefined : handleDragOver}
            onDragLeave={isDemo || !isProOrPremium ? undefined : handleDragLeave}
            style={{
              backgroundColor: '#f9fafb',
              borderColor: '#d1d5db',
              color: '#374151',
              minHeight: '140px',
              ...( !isProOrPremium ? { opacity: 0.8 } : {} )
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleInputChange}
              className="hidden"
              disabled={isUploading || isDemo || !isProOrPremium}
            />
            <div className="flex flex-col items-center justify-center w-full px-2">
              {/* Crown icon for non-pro/premium, upload for pro/premium */}
              {!isProOrPremium ? (
                <ProCrown className="w-10 h-10 mb-2 text-yellow-500" title="Fonctionnalité Pro/Premium" />
              ) : (
                <Upload className="mx-auto h-10 w-10 mb-2" style={{ color: dragActive ? establishmentColor : '#9ca3af' }} />
              )}
              {!isProOrPremium ? (
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-yellow-600 font-semibold">Fonctionnalité Premium</span>
                  <span className="text-xs text-gray-500">Cliquer pour découvrir les plans</span>
                  <span className="text-xs text-gray-700 text-center">Ajoutez une image à vos articles en passant au plan <span className="font-semibold">Pro</span> ou <span className="font-semibold">Premium</span>.</span>
                </div>
              ) : isUploading ? (
                <div className="flex flex-col items-center space-y-1">
                  <Loader2 className="h-6 w-6 animate-spin mb-1" style={{ color: establishmentColor }} />
                  <p className="text-sm text-gray-600 text-center">Optimisation et upload...</p>
                  <p className="text-xs text-gray-500 text-center">L'image est automatiquement optimisée</p>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-1">
                  <p className="text-sm text-gray-600 text-center">
                    <span className="font-medium hover:underline" style={{ color: establishmentColor }}>
                      Cliquez pour sélectionner
                    </span>
                    <span> ou glissez-déposez votre image</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Dialog */}
      <UpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        feature="Upload d'images"
        description="L'upload d'images pour vos articles vous permet de rendre votre menu plus attractif et d'augmenter l'appétit de vos clients."
      />
    </div>
  );
}
