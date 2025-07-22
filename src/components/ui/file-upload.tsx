import React, { useRef, useState } from 'react';
import { Upload, X, File, Image } from 'lucide-react';
import { Button } from './button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadProps {
  bucket: string;
  folder?: string;
  accept?: string;
  maxSize?: number; // in MB
  onUpload: (url: string) => void;
  currentFile?: string;
  label: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucket,
  folder = '',
  accept = "image/*",
  maxSize = 5,
  onUpload,
  currentFile,
  label,
  className = ""
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUpload(data.publicUrl);
      toast({
        title: "Success",
        description: "File uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async () => {
    if (!currentFile) return;

    try {
      // Extract file path from URL
      const url = new URL(currentFile);
      const filePath = url.pathname.split(`/storage/v1/object/public/${bucket}/`)[1];
      
      if (filePath) {
        await supabase.storage
          .from(bucket)
          .remove([filePath]);
      }

      onUpload('');
      toast({
        title: "Success",
        description: "File removed successfully"
      });
    } catch (error) {
      console.error('Error removing file:', error);
      toast({
        title: "Error",
        description: "Failed to remove file",
        variant: "destructive"
      });
    }
  };

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium">{label}</label>
      
      {currentFile ? (
        <div className="relative group">
          {isImage(currentFile) ? (
            <div className="relative">
              <img 
                src={currentFile} 
                alt="Uploaded file" 
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={removeFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted">
              <div className="flex items-center space-x-2">
                <File className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">File uploaded</p>
                  <p className="text-xs text-muted-foreground">Click to view</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(currentFile, '_blank')}
                >
                  View
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          } ${uploading ? 'opacity-50 pointer-events-none' : 'hover:border-primary/50'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept={accept}
            onChange={handleChange}
            disabled={uploading}
          />
          
          <div className="text-center">
            {uploading ? (
              <div className="space-y-2">
                <div className="animate-spin mx-auto h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {accept.includes('image') ? (
                  <Image className="mx-auto h-8 w-8 text-muted-foreground" />
                ) : (
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">Drop file here or click to upload</p>
                  <p className="text-xs text-muted-foreground">
                    Max size: {maxSize}MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};