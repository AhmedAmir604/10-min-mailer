'use client';

import { useState } from 'react';
import { Timer, Shuffle, Zap, Clock } from 'lucide-react';

type ExpiryDuration = '10min' | '30min' | '1hour' | '24hours';

interface EmailGeneratorProps {
  onEmailGenerated: (email: string) => void;
}

export default function EmailGenerator({ onEmailGenerated }: EmailGeneratorProps) {
  const [duration, setDuration] = useState<ExpiryDuration>('10min');
  const [customPrefix, setCustomPrefix] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const durationOptions = [
    { value: '10min', label: '10 minutes', icon: '⚡' },
    { value: '30min', label: '30 minutes', icon: '🔥' },
    { value: '1hour', label: '1 hour', icon: '⏰' },
    { value: '24hours', label: '24 hours', icon: '🌙' },
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
        setCustomPrefix('');
      } else {
        const error = await response.json();
        console.error('Failed to generate email:', error.error);
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
        <label className="flex items-center gap-2 text-xs font-medium text-white mb-3">
          <Timer className="w-3 h-3 text-blue-400" />
          Self-Destruct Timer
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          {durationOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setDuration(option.value as ExpiryDuration)}
              className={`p-2 rounded-xl border transition-all duration-300 text-left ${
                duration === option.value
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{option.icon}</span>
                <div className="font-medium text-xs">{option.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Prefix */}
      <div>
        <label className="flex items-center gap-2 text-xs font-medium text-white mb-2">
          <Shuffle className="w-3 h-3 text-purple-400" />
          Custom Prefix
          <span className="px-2 py-0.5 text-xs bg-gray-500/20 text-gray-400 rounded-full font-normal">
            Optional
          </span>
        </label>
        <input
          type="text"
          value={customPrefix}
          onChange={(e) => setCustomPrefix(e.target.value)}
          placeholder="Enter custom prefix"
          className="input text-sm py-2"
          minLength={3}
          maxLength={20}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={generateEmail}
        disabled={isLoading}
        className="btn-primary w-full py-3 text-sm font-semibold"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Generate Email
          </>
        )}
      </button>

      {/* Compact Info */}
      <div className="glass-card-minimal p-3">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-emerald-400" />
          <p className="text-xs text-gray-400">
            Auto-destructs after selected duration
          </p>
        </div>
      </div>
    </div>
  );
} 