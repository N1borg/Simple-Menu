import { Skeleton } from "@/components/ui/skeleton";

interface MenuItemSkeletonProps {
  displayStyle: "card" | "list" | "compact" | "table";
}

const MenuItemSkeleton = ({ displayStyle }: MenuItemSkeletonProps) => {
  switch (displayStyle) {
    case "card":
      return (
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between transition min-h-[7.5em]"
        style={{
            boxShadow: '0 1px 4px 0 rgba(0,0,0,0.07)',
            borderColor: 'transparent',
            outline: 'none'
        }}>
          <Skeleton className="h-7 w-32.5 overflow-hidden whitespace-nowrap relative" />
          <div className="relative min-h-[2.5em] max-h-[2.5em]">
            <div className="text-sm mt-1 select-none min-h-[2.5em] max-h-[2.5em]" style={{ color: "transparent", textDecoration: "none" }}>
              &nbsp;
            </div>
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-5.5 w-11 mt-2.5" />
          </div>
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
