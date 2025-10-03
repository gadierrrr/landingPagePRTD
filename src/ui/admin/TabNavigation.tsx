import React from 'react';

export interface TabNavItem {
  id: string;
  label: string;
  icon: string;
  count?: number;
  shortcut?: string;
}

interface TabNavigationProps {
  items: TabNavItem[];
  activeTab: string;
  onTabSelect: (tabId: string) => void;
}

export function TabNavigation({ items, activeTab, onTabSelect }: TabNavigationProps) {
  return (
    <div
      role="tablist"
      aria-label="Admin sections"
      className="border-brand-navy/10 -mx-4 mb-6 overflow-x-auto border-b px-4"
    >
      <div className="flex min-w-max gap-2 py-2">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabSelect(item.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-blue text-white shadow'
                  : 'bg-white text-brand-navy shadow-sm hover:bg-brand-sand/30'
              }`}
            >
              <span className="text-lg" aria-hidden>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {typeof item.count === 'number' && !Number.isNaN(item.count) && (
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs ${
                    isActive
                      ? 'border-white/40 bg-white/20 text-white'
                      : 'border-brand-navy/10 bg-brand-navy/5 text-brand-navy/70'
                  }`}
                >
                  {item.count}
                </span>
              )}
              {item.shortcut && (
                <span className="hidden text-[11px] font-semibold uppercase tracking-wider text-brand-navy/40 md:inline">
                  {item.shortcut}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
