'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Download, Loader2, AlertCircle, Mail, Phone, Calendar, BookOpen } from 'lucide-react';

interface ProgramInterest {
  id: string;
  programId: string;
  userId: string;
  createdAt: string;
  program: {
    titleAr: string;
    titleEn: string;
  };
  user: {
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
  };
}

export default function ProgramInterestsPage() {
  const [interests, setInterests] = useState<ProgramInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/programs/interests`,
        { credentials: 'include' }
      );

      if (!response.ok) throw new Error('فشل في جلب البيانات');

      const data = await response.json();
      setInterests(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const filteredInterests = interests.filter((interest) => {
    const query = searchQuery.toLowerCase();
    return (
      interest.program.titleAr.toLowerCase().includes(query) ||
      interest.program.titleEn.toLowerCase().includes(query) ||
      interest.user.email.toLowerCase().includes(query) ||
      interest.user.firstName.toLowerCase().includes(query) ||
      interest.user.lastName.toLowerCase().includes(query) ||
      (interest.user.phone && interest.user.phone.includes(query))
    );
  });

  const groupedByProgram = filteredInterests.reduce((acc, interest) => {
    const programId = interest.programId;
    if (!acc[programId]) {
      acc[programId] = {
        program: interest.program,
        interests: [],
      };
    }
    acc[programId].interests.push(interest);
    return acc;
  }, {} as Record<string, { program: { titleAr: string; titleEn: string }; interests: ProgramInterest[] }>);

  const exportToCSV = () => {
    const headers = ['البرنامج', 'الاسم', 'البريد الإلكتروني', 'رقم الجوال', 'تاريخ التسجيل'];
    const rows = filteredInterests.map((interest) => [
      interest.program.titleAr,
      `${interest.user.firstName} ${interest.user.lastName}`,
      interest.user.email,
      interest.user.phone || '-',
      new Date(interest.createdAt).toLocaleDateString('ar-SA'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `program-interests-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#32B7A8] to-[#0083BE] rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">الاهتمامات</h1>
              <p className="text-gray-600">المتدربون المهتمون بالبرامج غير المتاحة</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">إجمالي الاهتمامات</p>
                <p className="text-3xl font-bold text-gray-900">{interests.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">البرامج المطلوبة</p>
                <p className="text-3xl font-bold text-gray-900">{Object.keys(groupedByProgram).length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">متوسط الاهتمامات لكل برنامج</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Object.keys(groupedByProgram).length > 0
                    ? Math.round(interests.length / Object.keys(groupedByProgram).length)
                    : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Export */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن برنامج أو بريد إلكتروني..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#32B7A8] focus:border-[#32B7A8] transition-all"
              />
            </div>
            <button
              onClick={exportToCSV}
              disabled={filteredInterests.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-[#32B7A8] to-[#0083BE] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
            >
              <Download className="w-5 h-5" />
              تصدير CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Interests List */}
        {Object.keys(groupedByProgram).length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد اهتمامات حالياً</h3>
            <p className="text-gray-600">
              {searchQuery ? 'لم يتم العثور على نتائج للبحث' : 'لم يسجل أي متدرب اهتمامه بعد'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByProgram).map(([programId, data]) => (
              <motion.div
                key={programId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-[#32B7A8]/10 to-[#0083BE]/10 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{data.program.titleAr}</h3>
                      <p className="text-sm text-gray-600">{data.program.titleEn}</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-full">
                      <span className="text-sm font-bold text-[#32B7A8]">
                        {data.interests.length} {data.interests.length === 1 ? 'متدرب' : 'متدرب'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">المتدرب</th>
                          <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">البريد الإلكتروني</th>
                          <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">رقم الجوال</th>
                          <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">تاريخ التسجيل</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.interests.map((interest) => (
                          <tr key={interest.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">{interest.user.firstName} {interest.user.lastName}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900" dir="ltr">{interest.user.email}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {interest.user.phone ? (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-900" dir="ltr">{interest.user.phone}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {new Date(interest.createdAt).toLocaleDateString('ar-SA', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
