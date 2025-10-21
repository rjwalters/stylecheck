import { useState } from 'react';
import { ProfileSelector } from './components/profiles/ProfileSelector';
import { ProfileEditor } from './components/profiles/ProfileEditor';
import { mockProfiles } from './lib/data/mockProfiles';
import type { Profile } from './lib/types/profile';

function App() {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(mockProfiles[0]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">StyleCheck</h1>
              <p className="text-sm text-gray-600 mt-1">Code Aesthetics Engine</p>
            </div>
            <div className="text-sm text-gray-500">
              Phase 1: Profile Management
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Selector */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Select Style Profile
            </h2>
            <ProfileSelector
              profiles={mockProfiles}
              selectedProfile={selectedProfile}
              onSelectProfile={setSelectedProfile}
            />
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Using mock data for development. Real profile API will be implemented in Issue #8.
              </p>
            </div>
          </div>

          {/* Profile Editor */}
          <ProfileEditor profile={selectedProfile} />
        </div>
      </main>
    </div>
  );
}

export default App;
