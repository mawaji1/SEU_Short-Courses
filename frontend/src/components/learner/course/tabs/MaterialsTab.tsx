'use client';

import { FileText, Video, Link as LinkIcon, Download, ExternalLink } from 'lucide-react';

interface Material {
  id: string;
  titleAr: string;
  type: 'PDF' | 'VIDEO' | 'DOCUMENT' | 'LINK' | 'PRESENTATION';
  url: string;
  sizeBytes?: number;
}

interface MaterialsTabProps {
  materials: Material[];
}

export function MaterialsTab({ materials }: MaterialsTabProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'PDF':
        return { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' };
      case 'VIDEO':
        return { icon: Video, color: 'text-seu-purple', bg: 'bg-seu-purple/10' };
      case 'LINK':
        return { icon: LinkIcon, color: 'text-seu-blue', bg: 'bg-seu-blue/10' };
      default:
        return { icon: FileText, color: 'text-gray-500', bg: 'bg-gray-100' };
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (materials.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
        <FileText className="mx-auto h-16 w-16 text-gray-300" aria-hidden="true" />
        <p className="mt-4 text-gray-500">لا توجد مواد متاحة حالياً</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {materials.map((material) => {
        const config = getTypeConfig(material.type);
        const Icon = config.icon;
        const isExternal = material.type === 'LINK';

        return (
          <a
            key={material.id}
            href={material.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-seu-blue hover:shadow-md"
          >
            <div className={`rounded-lg p-3 ${config.bg}`}>
              <Icon className={`h-6 w-6 ${config.color}`} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 group-hover:text-seu-blue">
                {material.titleAr}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {material.type} {material.sizeBytes && `• ${formatFileSize(material.sizeBytes)}`}
              </p>
            </div>
            {isExternal ? (
              <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-seu-blue" aria-hidden="true" />
            ) : (
              <Download className="h-5 w-5 text-gray-400 group-hover:text-seu-blue" aria-hidden="true" />
            )}
          </a>
        );
      })}
    </div>
  );
}
