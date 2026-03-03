export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="aspect-[4/3] animate-pulse bg-slate-200" />
      <div className="flex flex-1 flex-col p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 flex gap-2">
          <div className="h-6 w-20 animate-pulse rounded bg-slate-200" />
          <div className="h-6 w-16 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
