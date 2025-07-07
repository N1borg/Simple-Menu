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
        <div className="flex items-center gap-4 p-4 rounded-xl shadow-md border bg-white transition min-h-[5.1em] mb-3"
        style={{
            boxShadow: '0 1px 4px 0 rgba(0,0,0,0.07)',
            borderColor: 'transparent',
            outline: 'none',
        }}>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <Skeleton className="h-7 w-32.5" />
          </div>
          <div className="flex flex-col items-end min-w-[70px]">
            <Skeleton className="h-7 w-12" />
          </div>
        </div>
      );
    case "compact":
      return (
        <div className="relative group">
          <div
            className="flex flex-col items-start gap-2 p-4 rounded-md shadow-md bg-white transition w-[120px] overflow-hidden"
            style={{
              boxShadow: "0 1px 4px 0 rgba(0,0,0,0.07)",
              borderColor: "transparent",
              outline: "none",
              width: "100%",
            }}
            tabIndex={0}
          >
            <Skeleton
              className="h-7 w-full max-w-[90%] rounded overflow-hidden whitespace-nowrap relative self-start"
              style={{
                textOverflow: "clip",
                display: "inline-block",
                position: "relative",
              }}
            />
            <div className="w-full flex justify-end">
              <Skeleton className="h-6 w-10 rounded" />
            </div>
          </div>
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
