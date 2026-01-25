'use client';

import { useState } from 'react';
import { Mail, MailOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  subject: string;
  message: string;
  sentAt: string;
  instructorName?: string;
  isRead: boolean;
}

interface MessagesTabProps {
  messages: Message[];
  onMarkAsRead: (messageId: string) => void;
}

export function MessagesTab({ messages, onMarkAsRead }: MessagesTabProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      onMarkAsRead(message.id);
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

  if (messages.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <Mail className="h-10 w-10 text-gray-400" aria-hidden="true" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-900">لا توجد رسائل</h3>
        <p className="text-gray-500">ستظهر رسائل المدرب هنا عند إرسالها</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Message List */}
      <div className="space-y-2 lg:col-span-1">
        {messages.map((message) => (
          <button
            key={message.id}
            onClick={() => handleMessageClick(message)}
            className={`w-full cursor-pointer rounded-xl border-2 p-4 text-right transition-all ${
              selectedMessage?.id === message.id
                ? 'border-primary bg-primary/5'
                : message.isRead
                  ? 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  : 'border-primary/30 bg-primary/5 hover:border-primary/50'
            }`}
          >
            <div className="flex items-start gap-3">
              {message.isRead ? (
                <MailOpen className="mt-1 h-5 w-5 text-gray-400" aria-hidden="true" />
              ) : (
                <Mail className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
              )}
              <div className="min-w-0 flex-1">
                <p className={`truncate font-semibold ${
                  message.isRead ? 'text-gray-700' : 'text-primary-dark'
                }`}>
                  {message.subject}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {formatDate(message.sentAt)}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Message Content */}
      <div className="lg:col-span-2">
        {selectedMessage ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h2>
              <p className="mt-2 text-sm text-gray-600">
                {selectedMessage.instructorName && `من: ${selectedMessage.instructorName} • `}
                {formatDate(selectedMessage.sentAt)}
              </p>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
              {selectedMessage.message}
            </div>
          </motion.div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-12">
            <div className="text-center">
              <Mail className="mx-auto h-16 w-16 text-gray-300" aria-hidden="true" />
              <p className="mt-4 text-gray-500">اختر رسالة لعرضها</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
