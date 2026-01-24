'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Edit2, Save, X } from 'lucide-react';
import { ProgramModule, Session } from '@/services/catalog/types';

interface CurriculumBuilderProps {
  programId: string;
  initialModules?: ProgramModule[];
  onUpdate?: () => void;
}

export function CurriculumBuilder({ programId, initialModules = [], onUpdate }: CurriculumBuilderProps) {
  const [modules, setModules] = useState<ProgramModule[]>(initialModules);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [moduleForm, setModuleForm] = useState({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    durationHours: '',
  });
  const [sessionForm, setSessionForm] = useState({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    durationMinutes: '',
  });
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateModule = async () => {
    if (!moduleForm.titleAr) {
      setError('يرجى إدخال عنوان الوحدة');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/curriculum/modules`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programId,
          titleAr: moduleForm.titleAr,
          titleEn: moduleForm.titleEn || undefined,
          descriptionAr: moduleForm.descriptionAr || undefined,
          descriptionEn: moduleForm.descriptionEn || undefined,
          durationHours: moduleForm.durationHours ? parseInt(moduleForm.durationHours) : undefined,
          sortOrder: modules.length,
        }),
      });

      if (!response.ok) throw new Error('فشل في إنشاء الوحدة');

      const newModule = await response.json();
      setModules([...modules, newModule]);
      setModuleForm({ titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', durationHours: '' });
      setShowModuleForm(false);
      onUpdate?.();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateModule = async (moduleId: string) => {
    try {
      setLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/curriculum/modules/${moduleId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titleAr: moduleForm.titleAr,
          titleEn: moduleForm.titleEn || undefined,
          descriptionAr: moduleForm.descriptionAr || undefined,
          descriptionEn: moduleForm.descriptionEn || undefined,
          durationHours: moduleForm.durationHours ? parseInt(moduleForm.durationHours) : undefined,
        }),
      });

      if (!response.ok) throw new Error('فشل في تحديث الوحدة');

      const updatedModule = await response.json();
      setModules(modules.map(m => m.id === moduleId ? updatedModule : m));
      setEditingModule(null);
      setModuleForm({ titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', durationHours: '' });
      onUpdate?.();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الوحدة؟')) return;

    try {
      setLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/curriculum/modules/${moduleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('فشل في حذف الوحدة');

      setModules(modules.filter(m => m.id !== moduleId));
      onUpdate?.();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (moduleId: string) => {
    if (!sessionForm.titleAr) {
      setError('يرجى إدخال عنوان الجلسة');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const module = modules.find(m => m.id === moduleId);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/curriculum/sessions`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId,
          titleAr: sessionForm.titleAr,
          titleEn: sessionForm.titleEn || undefined,
          descriptionAr: sessionForm.descriptionAr || undefined,
          descriptionEn: sessionForm.descriptionEn || undefined,
          durationMinutes: sessionForm.durationMinutes ? parseInt(sessionForm.durationMinutes) : undefined,
          sortOrder: module?.sessions?.length || 0,
        }),
      });

      if (!response.ok) throw new Error('فشل في إنشاء الجلسة');

      const newSession = await response.json();
      setModules(modules.map(m => {
        if (m.id === moduleId) {
          return { ...m, sessions: [...(m.sessions || []), newSession] };
        }
        return m;
      }));
      setSessionForm({ titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', durationMinutes: '' });
      setShowSessionForm(null);
      onUpdate?.();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, moduleId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الجلسة؟')) return;

    try {
      setLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/curriculum/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('فشل في حذف الجلسة');

      setModules(modules.map(m => {
        if (m.id === moduleId) {
          return { ...m, sessions: m.sessions?.filter(s => s.id !== sessionId) };
        }
        return m;
      }));
      onUpdate?.();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const startEditModule = (module: ProgramModule) => {
    setEditingModule(module.id);
    setModuleForm({
      titleAr: module.titleAr,
      titleEn: module.titleEn,
      descriptionAr: module.descriptionAr || '',
      descriptionEn: module.descriptionEn || '',
      durationHours: module.durationHours.toString(),
    });
  };

  const totalDuration = modules.reduce((sum, m) => sum + m.durationHours, 0);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">محتوى البرنامج</h3>
          <p className="text-sm text-gray-600">إجمالي الساعات: {totalDuration} ساعة</p>
        </div>
        <Button onClick={() => setShowModuleForm(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة وحدة
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add Module Form */}
      {showModuleForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-gray-900">وحدة جديدة</h4>
            <button onClick={() => setShowModuleForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="عنوان الوحدة *"
              value={moduleForm.titleAr}
              onChange={(e) => setModuleForm({ ...moduleForm, titleAr: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Title in English"
              value={moduleForm.titleEn}
              onChange={(e) => setModuleForm({ ...moduleForm, titleEn: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <textarea
              placeholder="الوصف بالعربية"
              value={moduleForm.descriptionAr}
              onChange={(e) => setModuleForm({ ...moduleForm, descriptionAr: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              rows={2}
            />
            <textarea
              placeholder="Description in English"
              value={moduleForm.descriptionEn}
              onChange={(e) => setModuleForm({ ...moduleForm, descriptionEn: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              rows={2}
            />
            <input
              type="number"
              placeholder="عدد الساعات"
              value={moduleForm.durationHours}
              onChange={(e) => setModuleForm({ ...moduleForm, durationHours: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              min="1"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateModule} disabled={loading} size="sm">
              حفظ الوحدة
            </Button>
            <Button onClick={() => setShowModuleForm(false)} variant="outline" size="sm">
              إلغاء
            </Button>
          </div>
        </div>
      )}

      {/* Modules List */}
      <div className="space-y-3">
        {modules.map((module, idx) => (
          <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
              <div className="flex-1">
                {editingModule === module.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={moduleForm.titleAr}
                        onChange={(e) => setModuleForm({ ...moduleForm, titleAr: e.target.value })}
                        className="border border-gray-200 rounded px-2 py-1 text-sm"
                      />
                      <input
                        type="text"
                        value={moduleForm.titleEn}
                        onChange={(e) => setModuleForm({ ...moduleForm, titleEn: e.target.value })}
                        className="border border-gray-200 rounded px-2 py-1 text-sm"
                      />
                      <input
                        type="number"
                        value={moduleForm.durationHours}
                        onChange={(e) => setModuleForm({ ...moduleForm, durationHours: e.target.value })}
                        className="border border-gray-200 rounded px-2 py-1 text-sm"
                        placeholder="الساعات"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateModule(module.id)}
                        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        حفظ
                      </button>
                      <button
                        onClick={() => {
                          setEditingModule(null);
                          setModuleForm({ titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', durationHours: '' });
                        }}
                        className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h4 className="font-bold text-gray-900">
                      الوحدة {idx + 1}: {module.titleAr}
                    </h4>
                    <p className="text-sm text-gray-600">{module.titleEn}</p>
                  </>
                )}
              </div>
              {editingModule !== module.id && (
                <>
                  {module.durationHours && <span className="text-sm text-accent font-medium">{module.durationHours} ساعة</span>}
                  <button
                    onClick={() => startEditModule(module)}
                    className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteModule(module.id)}
                    className="p-1.5 hover:bg-red-50 rounded text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                    className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                  >
                    {expandedModule === module.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Sessions */}
            {expandedModule === module.id && (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-gray-700">الجلسات</h5>
                  <Button
                    onClick={() => setShowSessionForm(module.id)}
                    size="sm"
                    variant="outline"
                    className="gap-2 h-8 text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    إضافة جلسة
                  </Button>
                </div>

                {/* Add Session Form */}
                {showSessionForm === module.id && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="موضوع الجلسة *"
                        value={sessionForm.titleAr}
                        onChange={(e) => setSessionForm({ ...sessionForm, titleAr: e.target.value })}
                        className="border border-gray-200 rounded px-2 py-1.5 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Title in English"
                        value={sessionForm.titleEn}
                        onChange={(e) => setSessionForm({ ...sessionForm, titleEn: e.target.value })}
                        className="border border-gray-200 rounded px-2 py-1.5 text-sm"
                      />
                      <input
                        type="number"
                        placeholder="المدة بالدقائق"
                        value={sessionForm.durationMinutes}
                        onChange={(e) => setSessionForm({ ...sessionForm, durationMinutes: e.target.value })}
                        className="border border-gray-200 rounded px-2 py-1.5 text-sm"
                        min="1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleCreateSession(module.id)} disabled={loading} size="sm" className="h-7 text-xs">
                        حفظ
                      </Button>
                      <Button onClick={() => setShowSessionForm(null)} variant="outline" size="sm" className="h-7 text-xs">
                        إلغاء
                      </Button>
                    </div>
                  </div>
                )}

                {/* Sessions List */}
                {module.sessions && module.sessions.length > 0 ? (
                  <ul className="space-y-2">
                    {module.sessions.map((session, sessionIdx) => (
                      <li key={session.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-medium flex items-center justify-center mt-0.5">
                          {sessionIdx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{session.titleAr}</p>
                          <p className="text-xs text-gray-600">{session.titleEn}</p>
                        </div>
                        {session.durationMinutes && <span className="text-xs text-gray-500">{session.durationMinutes} دقيقة</span>}
                        <button
                          onClick={() => handleDeleteSession(session.id, module.id)}
                          className="p-1 hover:bg-red-50 rounded text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">لا توجد جلسات بعد</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {modules.length === 0 && !showModuleForm && (
        <div className="text-center py-8 text-gray-500">
          <p>لم يتم إضافة وحدات بعد</p>
          <p className="text-sm">انقر على "إضافة وحدة" للبدء</p>
        </div>
      )}
    </div>
  );
}
