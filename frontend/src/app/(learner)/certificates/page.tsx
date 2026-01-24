'use client';

import { useState, useEffect } from 'react';
import { Loader2, Download, CheckCircle, Award, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/learner';

interface Certificate {
  id: string;
  number: string;
  issueDate: string;
  status: string;
  pdfUrl: string;
  verificationCode: string;
  cohort: {
    nameAr: string;
    program: {
      titleAr: string;
      titleEn: string;
    };
  };
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/certificates/my-certificates`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('فشل في جلب الشهادات');
      }

      const data = await response.json();
      setCertificates(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificateId: string, certificateNumber: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/certificates/${certificateId}/download`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('فشل في تحميل الشهادة');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${certificateNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل الشهادة');
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-seu-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <PageHeader
        title="شهاداتي"
        subtitle="عرض وتحميل الشهادات الصادرة لك"
      />

      <div className="p-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <Award className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              لا توجد شهادات بعد
            </h3>
            <p className="mt-2 text-gray-600">
              ستظهر شهاداتك هنا بعد إتمام البرامج التدريبية بنجاح
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all hover:border-seu-blue hover:shadow-lg"
              >
                {/* Certificate Header */}
                <div className="bg-gradient-to-br from-seu-blue to-seu-navy p-6 text-white">
                  <div className="mb-4 flex items-center justify-between">
                    <Award className="h-10 w-10" />
                    <span className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      معتمدة
                    </span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold">
                    {certificate.cohort.program.titleAr}
                  </h3>
                  <p className="text-sm text-white/80">
                    {certificate.cohort.nameAr}
                  </p>
                </div>

                {/* Certificate Details */}
                <div className="p-6">
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        تاريخ الإصدار:{' '}
                        {new Date(certificate.issueDate).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">رقم الشهادة:</span>{' '}
                      <span className="font-mono text-xs">{certificate.number}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleDownload(certificate.id, certificate.number)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-seu-blue px-4 py-3 font-medium text-white transition-colors hover:bg-seu-navy"
                    >
                      <Download className="h-4 w-4" />
                      تحميل الشهادة (PDF)
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          `/verify-certificate/${certificate.verificationCode}`,
                          '_blank'
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:border-seu-blue hover:text-seu-blue"
                    >
                      التحقق من الشهادة
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
