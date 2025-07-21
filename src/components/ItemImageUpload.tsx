import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Pencil, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ConfirmDeleteDialog from '@/components/ui/ConfirmDeleteDialog';
import type { MenuItem } from '@/types/supabase_types';

interface ItemImageUploadProps {
  item: MenuItem;
  onImageUploaded: (url: string | null) => void;
  isDemo?: boolean;
  className?: string;
}

interface UploadError {
  message: string;
  type: 'file' | 'network' | 'server';
}

export default function ItemImageUpload({
  item,
  onImageUploaded,
  isDemo = false,
  className = '',
}: ItemImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<UploadError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayedImageUrl, setDisplayedImageUrl] = useState<string | undefined>(item.image_url || undefined);

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
      {displayedImageUrl ? (
        <div className="relative w-full mb-4">
          <Image
            src={displayedImageUrl}
            alt="Image de l'article"
            width={600}
            height={180}
            className="w-full h-36 object-cover bg-white rounded-lg border border-gray-200"
            priority
            quality={90}
            sizes="100vw"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-70 hover:opacity-100 cursor-pointer"
                  title="Modifier"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Modifier l'image</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <ConfirmDeleteDialog
                    onConfirm={async () => {
                      try {
                        if (isDemo) {
                          toast.info('Modification désactivée (mode démo).');
                          return;
                        }
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
                          setDisplayedImageUrl(undefined);
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
                    }}
                    title="Confirmer la suppression"
                    description="Cette action supprimera l'image de l'article. Voulez-vous continuer ?"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Supprimer l'image</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleInputChange}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      ) : (
        <div
          className="relative w-full h-36 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg cursor-pointer mb-4"
          style={{ backgroundColor: '#f9fafb', borderColor: '#d1d5db', color: '#374151', minHeight: '140px' }}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleInputChange}
            className="hidden"
            disabled={isUploading}
          />
          <Upload className="h-7 w-7 mb-2" />
          <span className="block">Ajouter une image</span>
          {isUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
              <span className="text-xs text-gray-500">Optimisation et upload...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
