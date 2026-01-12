'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Users,
  FolderOpen,
  TrendingUp,
  ArrowLeft,
  Plus,
  Loader2,
} from 'lucide-react';

interface DashboardStats {
  totalPrograms: number;
  totalInstructors: number;
  totalCategories: number;
  totalEnrollments: number;
}

interface RecentProgram {
  id: string;
  titleAr: string;
  category: {
    nameAr: string;
  };
  status: string;
  _count: {
    cohorts: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPrograms: 0,
    totalInstructors: 0,
    totalCategories: 0,
    totalEnrollments: 0,
  });
  const [recentPrograms, setRecentPrograms] = useState<RecentProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const authData = localStorage.getItem('seu_auth');
      if (!authData) return;

      const auth = JSON.parse(authData);
      const headers = {
        Authorization: `Bearer ${auth.accessToken}`,
      };

      // Fetch all data in parallel
      const [programsRes, instructorsRes, categoriesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catalog/programs`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catalog/instructors`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catalog/categories`, { headers }),
      ]);

      const programsData = await programsRes.json();
      const instructorsData = await instructorsRes.json();
      const categoriesData = await categoriesRes.json();

      setStats({
        totalPrograms: programsData.data?.length || 0,
        totalInstructors: instructorsData.length || 0,
        totalCategories: categoriesData.length || 0,
        totalEnrollments: 0, // TODO: Add enrollments endpoint
      });

      // Get recent programs (first 5)
      setRecentPrograms(programsData.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
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

  const statsCards = [
    {
      title: 'إجمالي البرامج',
      value: stats.totalPrograms.toString(),
      icon: BookOpen,
      color: 'bg-accent/10 text-accent',
      href: '/admin/programs',
    },
    {
      title: 'المدربون النشطون',
      value: stats.totalInstructors.toString(),
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      href: '/admin/instructors',
    },
    {
      title: 'التصنيفات',
      value: stats.totalCategories.toString(),
      icon: FolderOpen,
      color: 'bg-purple-100 text-purple-600',
      href: '/admin/categories',
    },
    {
      title: 'الدفعات النشطة',
      value: recentPrograms.reduce((sum, p) => sum + (p._count?.cohorts || 0), 0).toString(),
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
      href: '/admin/programs',
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة التحكم</h1>
          <p className="text-gray-600">مرحباً بك في لوحة إدارة التعليم التنفيذي</p>
        </div>
        <Link href="/admin/programs">
          <Button className="gap-2">
            <Plus className="w-5 h-5" />
            إضافة برنامج
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <Link key={index} href={stat.href}>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Programs Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">أحدث البرامج</h2>
          <Link href="/admin/programs">
            <Button variant="outline" size="sm" className="gap-2">
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                  البرنامج
                </th>
                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                  التصنيف
                </th>
                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                  الدفعات
                </th>
                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                  الحالة
                </th>
                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {recentPrograms.map((program) => (
                <tr key={program.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{program.titleAr}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{program.category.nameAr}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {program._count?.cohorts || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${program.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700'
                          : program.status === 'DRAFT'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                    >
                      {program.status === 'PUBLISHED'
                        ? 'منشور'
                        : program.status === 'DRAFT'
                          ? 'مسودة'
                          : 'مؤرشف'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href="/admin/programs">
                      <Button variant="ghost" size="sm">
                        عرض
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {recentPrograms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد برامج</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
