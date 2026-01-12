'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const authData = localStorage.getItem('seu_auth');
      if (!authData) {
        setError('يرجى تسجيل الدخول أولاً');
        return;
      }

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/certificates/my-certificates`,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('فشل في جلب الشهادات');
      }

      const data = await response.json();
      setCertificates(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificateId: string, certificateNumber: string) => {
    try {
      const authData = localStorage.getItem('seu_auth');
      if (!authData) return;

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/certificates/${certificateId}/download`,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        },
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
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحميل الشهادة');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Award className="w-8 h-8 text-primary" />
            شهاداتي
          </h1>
          <p className="text-gray-600">
            عرض وتحميل الشهادات الصادرة لك من جامعة الأمير سلطان
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              لا توجد شهادات بعد
            </h3>
            <p className="text-gray-600">
              ستظهر شهاداتك هنا بعد إتمام البرامج التدريبية بنجاح
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Certificate Header */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Award className="w-10 h-10" />
                    <span className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      معتمدة
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {certificate.cohort.program.titleAr}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {certificate.cohort.nameAr}
                  </p>
                </div>

                {/* Certificate Details */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
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
                    <Button
                      onClick={() => handleDownload(certificate.id, certificate.number)}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 ml-2" />
                      تحميل الشهادة (PDF)
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        window.open(
                          `/verify-certificate/${certificate.verificationCode}`,
                          '_blank',
                        )
                      }
                    >
                      التحقق من الشهادة
                    </Button>
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
