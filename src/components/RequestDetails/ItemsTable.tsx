// components/RequestDetails/ItemsTable.tsx
import { Removal, RemovalReason, RemovalItem } from "@/types";
import { getRemovalReasonName, isReasonOther } from "@/utils/removalUtils";

interface ItemsTableProps {
  request: Removal;
  removalReasons: RemovalReason[];
}

const ItemsTable: React.FC<ItemsTableProps> = ({ request, removalReasons }) => {
  const hasItems = request.items && request.items.length > 0;

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Description of item(s) / Əşya (ların) təsviri</h3>
          <div className="border border-gray-400">
            {hasItems ? (
              <div className="divide-y">
                {request.items.map((item: RemovalItem, index: number) => (
                  <div key={index} className="p-2">{item.description}</div>
                ))}
              </div>
            ) : (
              <div className="p-2">{request.items?.[0]?.description || "No description available"}</div>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2">Reason of removal / Çıxarılma səbəbi</h3>
          <div className="border border-gray-400">
            {hasItems ? (
              <div className="divide-y">
                {request.items.map((item: RemovalItem, index: number) => (
                  <div key={index} className="p-2">
                    {isReasonOther(item.removalReasonId, item.removalReason?.name, removalReasons)
                      ? item.customReason
                      : getRemovalReasonName(item.removalReasonId, removalReasons)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2">
                {request.items?.[0]?.removalReasonId
                  ? isReasonOther(request.items[0].removalReasonId, undefined, removalReasons)
                    ? request.items[0].customReason
                    : getRemovalReasonName(request.items[0].removalReasonId, removalReasons)
                  : "No reason provided"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsTable;