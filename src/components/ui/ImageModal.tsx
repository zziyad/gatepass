import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageUrl }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <div className="relative w-full h-full flex items-center justify-center">
          <img 
            src={imageUrl} 
            alt="Full size" 
            className="max-h-[80vh] w-auto object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal; 