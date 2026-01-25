'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Download, CheckCircle, Award, Calendar } from 'lucide-react';

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
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCertificates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          router.push('/login');
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
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-gray-600">جاري تحميل الشهادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
            <Award className="h-7 w-7 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">شهاداتي</h1>
            <p className="text-gray-600">عرض وتحميل الشهادات الصادرة لك</p>
          </div>
        </div>
      </motion.div>

      <div>
        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center shadow-sm"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <Award className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">
              لا توجد شهادات بعد
            </h3>
            <p className="mx-auto max-w-md text-gray-600">
              ستظهر شهاداتك هنا بعد إتمام البرامج التدريبية بنجاح
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all hover:border-primary hover:shadow-lg"
              >
                {/* Certificate Header */}
                <div className="bg-gradient-to-br from-primary to-primary-dark p-6 text-white">
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
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
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
                      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:border-primary hover:text-primary"
                    >
                      التحقق من الشهادة
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
