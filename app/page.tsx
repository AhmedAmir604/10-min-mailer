'use client';

import { useState, useEffect } from 'react';
import { Mail, Copy, RefreshCw, Ghost, Zap, Sparkles, Shield } from 'lucide-react';
import EmailGenerator from '@/components/EmailGenerator';
import EmailInbox from '@/components/EmailInbox';
import CountdownTimer from '@/components/CountdownTimer';

export default function Home() {
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const [emailInfo, setEmailInfo] = useState<any>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEmailGenerated = (email: string) => {
    setCurrentEmail(email);
    localStorage.setItem('currentEmail', email);
    fetchEmails(email);
  };

  const fetchEmails = async (emailAddress: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/emails/${encodeURIComponent(emailAddress)}`);
      if (response.ok) {
        const data = await response.json();
        setEmailInfo(data.emailInfo);
        setEmails(data.emails);
      } else {
        console.error('Failed to fetch emails');
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (currentEmail) {
      fetchEmails(currentEmail);
    }
  };

  const copyToClipboard = async () => {
    if (currentEmail) {
      try {
        await navigator.clipboard.writeText(currentEmail);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem('currentEmail');
    if (savedEmail) {
      setCurrentEmail(savedEmail);
      fetchEmails(savedEmail);
    }
  }, []);

  useEffect(() => {
    if (currentEmail) {
      const interval = setInterval(() => {
        fetchEmails(currentEmail);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [currentEmail]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
      {/* Ambient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-purple-950/20 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <header className="relative border-b border-white/5 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-200 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Ghost className="w-5 h-5 text-black" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  GhostBox
                </h1>
                <p className="text-xs text-gray-500 font-medium">Ephemeral Email</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Shield className="w-3 h-3" />
              <span>Zero-trace privacy</span>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Clean Hero + Generator Section */}
        <div className="grid lg:grid-cols-5 gap-8 mb-10 lg:items-start">
          {/* Hero Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300 font-medium">Self-destructing emails</span>
            </div>
            
            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Temporary Email
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  That Vanishes
                </span>
              </h2>
              
              <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                Create disposable email addresses that automatically self-destruct. 
                Perfect for signups, testing, and protecting your privacy.
              </p>
            </div>

            {/* Active Email Display - Compact */}
            {currentEmail && (
              <div className="glass-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                    <span className="text-sm font-semibold text-white">Active Email</span>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="glass-button p-2 hover:scale-105 transition-transform"
                    title="Refresh inbox"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                {/* Email Address - Compact */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-sm" />
                  <div className="relative bg-black/60 border border-white/20 rounded-xl p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Your temporary address</p>
                        <code className="text-sm text-blue-400 font-mono break-all block">
                          {currentEmail}
                        </code>
                      </div>
                      <button
                        onClick={copyToClipboard}
                        className={`glass-button px-3 py-2 text-xs font-medium transition-all duration-300 ${
                          copied 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 scale-105' 
                            : 'hover:scale-105'
                        }`}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Compact Stats Grid */}
                {emailInfo && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="glass-card-minimal p-3 text-center">
                      <div className="text-xl font-bold text-white mb-1">{emailInfo.emailCount}</div>
                      <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Messages</div>
                    </div>
                    <div className="glass-card-minimal p-3 text-center">
                      <div className="flex justify-center mb-1">
                        <CountdownTimer expiresAt={new Date(emailInfo.expiresAt)} />
                      </div>
                      <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Time Left</div>
                    </div>
                    <div className="glass-card-minimal p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-400">Live</span>
                      </div>
                      <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Status</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Email Generator - Clean & Aligned */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 h-full">
              <EmailGenerator onEmailGenerated={handleEmailGenerated} />
            </div>
          </div>
        </div>

        {/* Clean Inbox Section */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Inbox</h3>
                <p className="text-sm text-gray-400">Messages appear instantly</p>
              </div>
              {emails.length > 0 && (
                <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-full text-sm font-medium">
                  {emails.length} {emails.length === 1 ? 'message' : 'messages'}
                </div>
              )}
            </div>
          </div>

          {!currentEmail ? (
            <div className="text-center py-16">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-gray-500" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-3">No Active Email</h4>
              <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                Generate a temporary email address above to start receiving messages instantly
              </p>
            </div>
          ) : (
            <EmailInbox 
              emails={emails} 
              isLoading={isLoading}
              onEmailRead={(emailId) => {
                setEmails(prev => prev.map(email => 
                  email.id === emailId ? { ...email, isRead: true } : email
                ));
              }}
            />
          )}
        </div>
      </div>


    </div>
  );
} 