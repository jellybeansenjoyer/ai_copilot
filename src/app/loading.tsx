import { Loader2 } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3 text-gray-600">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" aria-hidden />
        <p className="text-sm">Loading…</p>
      </div>
    </div>
  );
}
