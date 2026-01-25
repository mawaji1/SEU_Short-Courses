'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, Award, Calendar, User, BookOpen } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface CertificateVerification {
  valid: boolean;
  certificate?: {
    number: string;
    userName: string;
    programName: string;
    issuedAt: string;
    status: string;
  };
}

export default function VerifyCertificatePage() {
  const params = useParams();
  const code = params.code as string;
  const [verification, setVerification] = useState<CertificateVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (code) {
      verifyCertificate();
    }
  }, [code]);

  const verifyCertificate = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/certificates/verify/${code}`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError('الشهادة غير موجودة');
        } else {
          throw new Error('فشل في التحقق من الشهادة');
        }
        return;
      }

      const data = await response.json();
      setVerification(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التحقق من الشهادة');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">جاري التحقق من الشهادة...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12" dir="rtl">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Award className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            التحقق من الشهادة
          </h1>
          <p className="text-gray-600">
            الجامعة السعودية الإلكترونية - نظام التحقق من الشهادات
          </p>
        </div>

        {/* Verification Result */}
        {error ? (
          <div className="bg-white rounded-lg shadow-lg border-2 border-red-200 p-8">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                الشهادة غير صالحة
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <p className="text-sm text-gray-500">
                يرجى التأكد من رمز التحقق والمحاولة مرة أخرى
              </p>
            </div>
          </div>
        ) : verification?.valid ? (
          <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-8">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                شهادة صالحة ومعتمدة
              </h2>
              <p className="text-gray-600">
                هذه الشهادة صادرة من الجامعة السعودية الإلكترونية وموثقة رسمياً
              </p>
            </div>

            {/* Certificate Details */}
            <div className="border-t border-gray-200 pt-6 space-y-6">
              {/* Certificate Number */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">رقم الشهادة</div>
                <div className="text-lg font-mono font-bold text-gray-900">
                  {verification.certificate?.number}
                </div>
              </div>

              {/* Holder Name */}
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">اسم الحاصل على الشهادة</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {verification.certificate?.userName}
                  </div>
                </div>
              </div>

              {/* Program Name */}
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">البرنامج التدريبي</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {verification.certificate?.programName}
                  </div>
                </div>
              </div>

              {/* Issue Date */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">تاريخ الإصدار</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {new Date(verification.certificate?.issuedAt || '').toLocaleDateString(
                      'ar-SA',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      },
                    )}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  الشهادة صالحة وغير ملغاة
                </span>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                تم التحقق من هذه الشهادة في:{' '}
                {new Date().toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg border-2 border-yellow-200 p-8">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                الشهادة ملغاة
              </h2>
              <p className="text-gray-600">
                هذه الشهادة تم إلغاؤها ولم تعد صالحة
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
    <Footer />
    </>
  );
}
