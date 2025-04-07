// components/RequestDetails/ImagesSection.tsx
import { Button } from "@/components/ui/button";
import { RemovalImage } from "@/types";

interface ImagesSectionProps {
  images: RemovalImage[];
  onImageClick: (url: string) => void;
}

const ImagesSection: React.FC<ImagesSectionProps> = ({ images, onImageClick }) => (
  <div className="mt-6">
    <h3 className="text-sm font-medium mb-2">Images</h3>
    <div className="grid grid-cols-2 gap-2">
      {images.map((image: RemovalImage, index: number) => (
        <Button
          key={image.id}
          variant="outline"
          className="text-left flex items-center gap-2 h-auto py-2"
          onClick={() => onImageClick(image.url || "")}
          aria-label={`View Image ${index + 1}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Image {index + 1}
        </Button>
      ))}
    </div>
  </div>
);

export default ImagesSection;