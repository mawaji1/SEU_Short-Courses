import { Suspense, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function SuspenseWrapper({ children, fallback }: SuspenseWrapperProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-gray-600">جاري التحميل...</p>
            </div>
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}
