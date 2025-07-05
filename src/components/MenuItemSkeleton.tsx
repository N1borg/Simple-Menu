import { Skeleton } from "@/components/ui/skeleton";

interface MenuItemSkeletonProps {
  displayStyle: "card" | "list" | "compact" | "table";
}

const MenuItemSkeleton = ({ displayStyle }: MenuItemSkeletonProps) => {
  switch (displayStyle) {
    case "card":
      return (
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      );
    case "list":
      return (
        <div className="flex items-center gap-4 p-2 bg-white">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      );
    case "compact":
      return (
        <div className="flex items-center gap-2 p-2">
          <Skeleton className="h-4 w-20" />
        </div>
      );
    case "table":
      return (
        <div className="grid grid-cols-4 gap-4 p-2 border-b">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      );
    default:
      return null;
  }
};

export default MenuItemSkeleton;
