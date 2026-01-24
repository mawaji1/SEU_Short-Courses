'use client';

import { use } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header, Footer } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth';
import { ArrowRight, Mail, MailOpen, Clock, ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface Instructor {
  id: string;
  nameAr: string;
  nameEn: string;
  imageUrl: string | null;
}

interface Message {
  id: string;
  subject: string;
  message: string;
  sentAt: string;
  instructor: Instructor | null;
  isRead: boolean;
  readAt: string | null;
}

export default function MessagesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const enrollmentId = resolvedParams.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [cohortId, setCohortId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setError(null);
        // First, get enrollment details to get cohortId
        const enrollmentRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/enrollments/${enrollmentId}/details`,
          {
            credentials: 'include',
          },
        );

        if (!enrollmentRes.ok) {
          if (enrollmentRes.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('فشل تحميل بيانات التسجيل');
        }

        const enrollmentData = await enrollmentRes.json();
        const fetchedCohortId = enrollmentData.cohort.id;
        setCohortId(fetchedCohortId);

        // Then fetch messages for this cohort
        const messagesRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/cohorts/${fetchedCohortId}/messages`,
          {
            credentials: 'include',
          },
        );

        if (!messagesRes.ok) {
          throw new Error('فشل تحميل الرسائل');
        }

        const messagesData = await messagesRes.json();
        setMessages(messagesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [enrollmentId, router]);

  const markAsRead = async (messageId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/messages/${messageId}/read`,
        {
          method: 'PUT',
          credentials: 'include',
        },
      );

      if (res.ok) {
        // Update local state
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, isRead: true, readAt: new Date().toISOString() }
              : msg,
          ),
        );
      }
    } catch (err) {
      // Silent fail for read receipts - not critical
    }
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Loading state
  if (loading) {
    return (
      <ProtectedRoute>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center" dir="rtl">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-gray-600">جاري تحميل الرسائل...</p>
          </div>
        </main>
        <Footer />
      </ProtectedRoute>
    );
  }

  // Error state
  if (error) {
    return (
      <ProtectedRoute>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center" dir="rtl">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">حدث خطأ</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push(`/my-courses/${enrollmentId}`)}
              >
                العودة للبرنامج
              </Button>
              <Button onClick={() => window.location.reload()}>
                إعادة المحاولة
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
        {/* Breadcrumb */}
        <section className="bg-white border-b py-4">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/my-courses" className="hover:text-primary transition-colors">
                دوراتي
              </Link>
              <ChevronLeft className="w-4 h-4" />
              <Link
                href={`/my-courses/${enrollmentId}`}
                className="hover:text-primary transition-colors"
              >
                تفاصيل البرنامج
              </Link>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-gray-900 font-medium">الرسائل</span>
            </nav>
          </div>
        </section>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-primary-dark to-primary text-white py-12">
          <div className="container mx-auto px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold mb-2"
            >
              الرسائل والإعلانات
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/80"
            >
              جميع الرسائل والإعلانات من المدرب
            </motion.p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-4"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  الرسائل ({messages.length})
                </h2>

                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد رسائل حتى الآن</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <motion.button
                        key={message.id}
                        onClick={() => handleMessageClick(message)}
                        className={`w-full text-right p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          selectedMessage?.id === message.id
                            ? 'border-primary bg-primary/5'
                            : message.isRead
                              ? 'border-gray-200 bg-gray-50 hover:border-gray-300'
                              : 'border-primary/30 bg-primary/5 hover:border-primary/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-3">
                          {message.isRead ? (
                            <MailOpen className="w-5 h-5 text-gray-400 mt-1" />
                          ) : (
                            <Mail className="w-5 h-5 text-primary mt-1" />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-semibold text-sm mb-1 truncate ${
                                message.isRead ? 'text-gray-700' : 'text-primary-dark'
                              }`}
                            >
                              {message.subject}
                            </h3>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(message.sentAt)}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Message Content */}
            <div className="lg:col-span-2">
              {selectedMessage ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  {/* Message Header */}
                  <div className="border-b pb-4 mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {selectedMessage.subject}
                        </h2>
                        <div className="flex items-center gap-3">
                          {selectedMessage.instructor?.imageUrl ? (
                            <img
                              src={selectedMessage.instructor.imageUrl}
                              alt={selectedMessage.instructor.nameAr}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold">
                              {selectedMessage.instructor?.nameAr.charAt(0) || 'م'}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">
                              {selectedMessage.instructor?.nameAr || 'المدرب'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(selectedMessage.sentAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {selectedMessage.isRead && (
                        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm">
                          <MailOpen className="w-4 h-4" />
                          <span>تمت القراءة</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="prose prose-lg max-w-none">
                    <div
                      className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                      style={{ direction: 'rtl' }}
                    >
                      {selectedMessage.message}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-12"
                >
                  <div className="text-center">
                    <Mail className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      اختر رسالة لعرضها
                    </h3>
                    <p className="text-gray-500">
                      اضغط على رسالة من القائمة لعرض محتواها
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => router.push(`/my-courses/${enrollmentId}`)}
            >
              <ChevronLeft className="w-4 h-4 ml-2" />
              العودة للبرنامج
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}
