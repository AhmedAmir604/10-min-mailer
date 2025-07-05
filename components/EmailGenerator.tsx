'use client';

import { useState } from 'react';
import { Clock, Shuffle } from 'lucide-react';

type ExpiryDuration = '10min' | '30min' | '1hour' | '24hours';

interface EmailGeneratorProps {
  onEmailGenerated: (email: string) => void;
}

export default function EmailGenerator({ onEmailGenerated }: EmailGeneratorProps) {
  const [duration, setDuration] = useState<ExpiryDuration>('10min');
  const [customPrefix, setCustomPrefix] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const durationOptions = [
    { value: '10min', label: '10 Minutes' },
    { value: '30min', label: '30 Minutes' },
    { value: '1hour', label: '1 Hour' },
    { value: '24hours', label: '24 Hours' },
  ];

  const generateEmail = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration,
          customPrefix: customPrefix.trim() || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onEmailGenerated(data.email);
        setCustomPrefix(''); // Clear custom prefix after successful generation
      } else {
        const error = await response.json();
        console.error('Failed to generate email:', error.error);
        // You could add error handling/toast here
      }
    } catch (error) {
      console.error('Error generating email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Duration Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Clock className="w-4 h-4 inline mr-1" />
          Email Duration
        </label>
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value as ExpiryDuration)}
          className="input"
        >
          {durationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Prefix */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Prefix (Optional)
        </label>
        <input
          type="text"
          value={customPrefix}
          onChange={(e) => setCustomPrefix(e.target.value)}
          placeholder="Enter custom prefix..."
          className="input"
          minLength={3}
          maxLength={20}
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty for random generation. 3-20 characters allowed.
        </p>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateEmail}
        disabled={isLoading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Shuffle className="w-4 h-4" />
            Generate Email
          </>
        )}
      </button>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          💡 Your email will be automatically deleted after the selected duration expires.
        </p>
      </div>
    </div>
  );
} 