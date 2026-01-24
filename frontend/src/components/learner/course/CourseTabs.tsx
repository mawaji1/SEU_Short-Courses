'use client';

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon?: React.ElementType;
  badge?: number;
  content: ReactNode;
}

interface CourseTabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function CourseTabs({ tabs, defaultTab }: CourseTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div>
      {/* Tab List */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="flex gap-1 p-1" role="tablist" aria-label="أقسام الدورة">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-all ${
                  isActive
                    ? 'text-seu-blue'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      isActive ? 'bg-seu-blue/10 text-seu-blue' : 'bg-seu-orange text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-seu-blue"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="p-6"
      >
        {activeContent}
      </motion.div>
    </div>
  );
}
