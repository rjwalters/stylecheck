import { useState } from 'react';
import type { Profile } from '../../lib/types/profile';

interface ProfileSelectorProps {
  profiles: Profile[];
  selectedProfile: Profile | null;
  onSelectProfile: (profile: Profile) => void;
}

export function ProfileSelector({
  profiles,
  selectedProfile,
  onSelectProfile,
}: ProfileSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full max-w-md">
      <label htmlFor="profile-select" className="block text-sm font-medium mb-2">
        Style Profile
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="block font-medium">
              {selectedProfile?.name || 'Select a profile'}
            </span>
            {selectedProfile?.description && (
              <span className="block text-sm text-gray-500">
                {selectedProfile.description}
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <ul
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {profiles.map((profile) => (
            <li
              key={profile.id}
              role="option"
              aria-selected={selectedProfile?.id === profile.id}
              className={`
                px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors
                ${selectedProfile?.id === profile.id ? 'bg-blue-100' : ''}
              `}
              onClick={() => {
                onSelectProfile(profile);
                setIsOpen(false);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{profile.name}</span>
                    {profile.is_builtin && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        Built-in
                      </span>
                    )}
                  </div>
                  {profile.description && (
                    <p className="text-sm text-gray-600 mt-1">{profile.description}</p>
                  )}
                  {profile.languages.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {profile.languages.map((lang) => (
                        <span
                          key={lang}
                          className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
