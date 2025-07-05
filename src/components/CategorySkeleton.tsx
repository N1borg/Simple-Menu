import { Skeleton } from "@/components/ui/skeleton";

const CategorySkeleton = () => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Skeleton className="h-9 w-9" />
      <Skeleton className="h-8 w-55" />
      <Skeleton className="h-9 w-9" />
    </div>
  );
};

export default CategorySkeleton;
