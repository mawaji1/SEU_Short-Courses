'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, MailOpen, Clock, Loader2, User, BookOpen } from 'lucide-react';

interface Message {
  id: string;
  subject: string;
  message: string;
  sentAt: string;
  isRead: boolean;
  cohortId: string;
  cohortName: string;
  programTitle: string;
  instructor: {
    nameAr: string;
  } | null;
}

interface Enrollment {
  id: string;
  cohort: {
    id: string;
    nameAr: string;
    program: {
      titleAr: string;
    };
  };
}

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const fetchAllMessages = async () => {
      try {
        // First get all enrollments
        const enrollmentsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/enrollments/my-courses`,
          { credentials: 'include' }
        );

        if (enrollmentsRes.status === 401) {
          router.push('/login');
          return;
        }

        if (!enrollmentsRes.ok) {
          setLoading(false);
          return;
        }

        const enrollments: Enrollment[] = await enrollmentsRes.json();

        // Fetch messages for each cohort in parallel
        const allMessages: Message[] = [];

        await Promise.all(
          enrollments.map(async (enrollment) => {
            try {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/cohorts/${enrollment.cohort.id}/messages`,
                { credentials: 'include' }
              );

              if (res.ok) {
                const cohortMessages = await res.json();
                // Add cohort info to each message
                cohortMessages.forEach((msg: any) => {
                  allMessages.push({
                    ...msg,
                    cohortId: enrollment.cohort.id,
                    cohortName: enrollment.cohort.nameAr,
                    programTitle: enrollment.cohort.program.titleAr,
                  });
                });
              }
            } catch {
              // Silent fail for individual cohort
            }
          })
        );

        // Sort by date descending
        allMessages.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
        setMessages(allMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMessages();
  }, [router]);

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${messageId}/read`, {
        method: 'PUT',
        credentials: 'include',
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    } catch {
      // Silent fail
    }
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      handleMarkAsRead(message.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const filteredMessages = filter === 'unread'
    ? messages.filter(m => !m.isRead)
    : messages;

  const unreadCount = messages.filter(m => !m.isRead).length;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-gray-600">جاري تحميل الرسائل...</p>
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
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الرسائل</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} رسالة غير مقروءة` : 'جميع الرسائل مقروءة'}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            الكل ({messages.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            غير مقروءة ({unreadCount})
          </button>
        </div>
      </motion.div>

      {/* Messages Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Messages List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-1"
        >
          {filteredMessages.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                {filter === 'unread' ? 'لا توجد رسائل غير مقروءة' : 'لا توجد رسائل'}
              </h3>
              <p className="text-gray-500">
                {messages.length === 0
                  ? 'ستظهر هنا الرسائل من مدربي الدورات المسجل بها'
                  : 'لقد قرأت جميع الرسائل'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {filteredMessages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className={`w-full cursor-pointer p-4 text-right transition-colors ${
                    selectedMessage?.id === message.id
                      ? 'bg-primary/5 border-r-4 border-primary'
                      : message.isRead
                        ? 'hover:bg-gray-50'
                        : 'bg-primary/5 hover:bg-primary/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {message.isRead ? (
                      <MailOpen className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
                    ) : (
                      <Mail className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={`truncate font-semibold ${
                        message.isRead ? 'text-gray-700' : 'text-gray-900'
                      }`}>
                        {message.subject}
                      </p>
                      <p className="mt-1 truncate text-sm text-gray-500">
                        {message.programTitle}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {formatDate(message.sentAt)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Message Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2"
        >
          {selectedMessage ? (
            <div>
              <div className="mb-6 border-b border-gray-100 pb-6">
                <h2 className="mb-3 text-xl font-bold text-gray-900">
                  {selectedMessage.subject}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {selectedMessage.instructor?.nameAr || 'المدرب'}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatDate(selectedMessage.sentAt)}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {selectedMessage.programTitle}
                  </span>
                </div>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
                {selectedMessage.message}
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[400px] items-center justify-center">
              <div className="text-center">
                <Mail className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-lg font-bold text-gray-900">اختر رسالة</h3>
                <p className="text-gray-500">اختر رسالة من القائمة لعرض محتواها</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
