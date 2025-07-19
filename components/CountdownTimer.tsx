'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Zap } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: Date;
}

export default function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const remaining = Math.max(0, expiry - now);
      setTimeRemaining(remaining);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusInfo = () => {
    const totalMinutes = timeRemaining / (1000 * 60);
    
    if (totalMinutes > 10) {
      return {
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/20',
        borderColor: 'border-emerald-500/30',
        icon: Zap,
        status: 'Active'
      };
    } else if (totalMinutes > 2) {
      return {
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
        borderColor: 'border-amber-500/30',
        icon: Clock,
        status: 'Expiring Soon'
      };
    } else {
      return {
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        icon: AlertTriangle,
        status: 'Critical'
      };
    }
  };

  if (timeRemaining <= 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-xl">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <span className="text-red-400 font-semibold text-sm">Expired</span>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  return (
    <div className={`flex items-center gap-1 px-2 py-1 ${statusInfo.bgColor} border ${statusInfo.borderColor} rounded-lg`}>
      <Icon className={`w-3 h-3 ${statusInfo.color}`} />
      <span className={`${statusInfo.color} font-semibold text-xs`}>
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
} 