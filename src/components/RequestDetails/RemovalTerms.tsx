// components/RequestDetails/RemovalTerms.tsx
import { isReturnable } from "@/utils/removalUtils";
import { Removal } from "@/types";

interface RemovalTermsProps {
  request: Removal;
}

const RemovalTerms: React.FC<RemovalTermsProps> = ({ request }) => {
  const returnable = isReturnable(request);

  return (
    <div className="border-b pb-4">
      <h3 className="font-bold mb-4 text-lg">Removal terms / Çıxarılma şərtləri:</h3>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <label className="flex items-center">
            <div className={`w-5 h-5 border border-gray-400 mr-2 ${!returnable ? "bg-black" : ""}`}></div>
            Non-returnable / Geri qaytarılmayan
          </label>
        </div>
        <div>
          <label className="flex items-center">
            <div className={`w-5 h-5 border border-gray-400 mr-2 ${returnable ? "bg-black" : ""}`}></div>
            Returnable / Geri qaytarılan
          </label>
        </div>
      </div>
    </div>
  );
};

export default RemovalTerms;