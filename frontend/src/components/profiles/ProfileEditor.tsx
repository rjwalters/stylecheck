import { useState } from 'react';
import type { Profile } from '../../lib/types/profile';

interface ProfileEditorProps {
  profile: Profile | null;
}

type TabName = 'naming' | 'organization' | 'documentation' | 'typing' | 'structure' | 'error_handling' | 'practices';

export function ProfileEditor({ profile }: ProfileEditorProps) {
  const [activeTab, setActiveTab] = useState<TabName>('naming');

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Select a profile to view its preferences
      </div>
    );
  }

  const tabs: { name: TabName; label: string }[] = [
    { name: 'naming', label: 'Naming' },
    { name: 'organization', label: 'Organization' },
    { name: 'documentation', label: 'Documentation' },
    { name: 'typing', label: 'Type Annotations' },
    { name: 'structure', label: 'Structure' },
    { name: 'error_handling', label: 'Error Handling' },
    { name: 'practices', label: 'Modern Practices' },
  ];

  const renderPreferences = (category: TabName) => {
    const prefs = profile.preferences[category];
    if (!prefs) return null;

    return (
      <div className="space-y-4">
        {Object.entries(prefs).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700 capitalize">
              {key.replace(/_/g, ' ')}
            </span>
            <span className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md font-medium">
              {String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Profile Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
            {profile.description && (
              <p className="text-gray-600 mt-1">{profile.description}</p>
            )}
          </div>
          {profile.is_builtin && (
            <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
              Built-in Profile (Read-only)
            </span>
          )}
        </div>

        {profile.author && (
          <p className="text-sm text-gray-500 mt-2">Author: {profile.author}</p>
        )}

        {profile.languages.length > 0 && (
          <div className="flex gap-2 mt-3">
            <span className="text-sm text-gray-600">Languages:</span>
            {profile.languages.map((lang) => (
              <span key={lang} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                {lang}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-2 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`
                whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.name
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              aria-current={activeTab === tab.name ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderPreferences(activeTab)}
      </div>

      {/* Custom Rules */}
      {profile.custom_rules.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Custom Rules</h3>
          <ul className="space-y-2">
            {profile.custom_rules.map((rule, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-medium mr-3 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-700">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={profile.is_builtin}
          title={profile.is_builtin ? 'Cannot edit built-in profiles' : 'Save changes'}
        >
          Save
        </button>
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Duplicate
        </button>
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Export
        </button>
        <button
          className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed ml-auto"
          disabled={profile.is_builtin}
          title={profile.is_builtin ? 'Cannot delete built-in profiles' : 'Delete profile'}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
