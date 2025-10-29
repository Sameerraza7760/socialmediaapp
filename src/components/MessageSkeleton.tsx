import { Skeleton } from "@/components/ui/skeleton";

export function MessageSkeleton() {
  const bubbles = [
    { align: "start", width: "w-3/5" },
    { align: "end", width: "w-1/2" },
    { align: "start", width: "w-2/3" },
    { align: "end", width: "w-1/3" },
    { align: "start", width: "w-1/2" },
  ];

  return (
    <div className="flex flex-col space-y-3">
      {bubbles.map((bubble, index) => (
        <div
          key={index}
          className={`flex justify-${bubble.align}`}
        >
          <div
            className={`p-3 rounded-2xl ${bubble.align === "end"
              ? "bg-primary/10 rounded-br-none"
              : "bg-muted rounded-bl-none"
              }`}
          >
            <Skeleton
              className={`h-4 ${bubble.width} ${
                bubble.align === "end"
                  ? "bg-primary/30"
                  : "bg-muted-foreground/20"
              }`}
            />
            <div className="flex justify-end mt-2">
              <Skeleton className="h-3 w-10 rounded-md bg-muted-foreground/20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
