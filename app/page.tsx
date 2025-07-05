'use client';

import { useState, useEffect } from 'react';
import { Mail, Clock, Copy, RefreshCw, Settings, Trash2 } from 'lucide-react';
import EmailGenerator from '@/components/EmailGenerator';
import EmailInbox from '@/components/EmailInbox';
import CountdownTimer from '@/components/CountdownTimer';

export default function Home() {
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const [emailInfo, setEmailInfo] = useState<any>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailGenerated = (email: string) => {
    setCurrentEmail(email);
    localStorage.setItem('currentEmail', email);
    fetchEmails(email);
  };

  const fetchEmails = async (emailAddress: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/emails/${encodeURIComponent(emailAddress)}`);
      console.log(response)
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
        // You could add a toast notification here
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  // Load saved email from localStorage on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('currentEmail');
    if (savedEmail) {
      setCurrentEmail(savedEmail);
      fetchEmails(savedEmail);
    }
  }, []);

  // Auto-refresh emails every 30 seconds
  useEffect(() => {
    if (currentEmail) {
      const interval = setInterval(() => {
        fetchEmails(currentEmail);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [currentEmail]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Mail className="w-8 h-8 text-primary-500" />
          <h1 className="text-4xl font-bold text-gray-900">10 Minute Mail</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Get a temporary email address that expires automatically. Perfect for testing and avoiding spam.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Email Generator Section */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Generate Email
            </h2>
            <EmailGenerator onEmailGenerated={handleEmailGenerated} />
          </div>

          {/* Current Email Display */}
          {currentEmail && (
            <div className="card mt-6">
              <h3 className="text-lg font-semibold mb-3">Your Temporary Email</h3>
              <div className="bg-gray-50 p-3 rounded-lg border">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-mono text-gray-800 break-all">
                    {currentEmail}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Email Info */}
              {emailInfo && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Emails received:</span>
                    <span className="font-medium">{emailInfo.emailCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Time remaining:</span>
                    <CountdownTimer expiresAt={new Date(emailInfo.expiresAt)} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Email Inbox Section */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Inbox {emails.length > 0 && `(${emails.length})`}
              </h2>
              
              <button
                onClick={handleRefresh}
                disabled={isLoading || !currentEmail}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {!currentEmail ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Email Selected</h3>
                <p className="text-gray-500">Generate a temporary email address to start receiving emails.</p>
              </div>
            ) : (
              <EmailInbox 
                emails={emails} 
                isLoading={isLoading}
                onEmailRead={(emailId) => {
                  // Mark email as read in the UI
                  setEmails(prev => prev.map(email => 
                    email.id === emailId ? { ...email, isRead: true } : email
                  ));
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-12 text-gray-500 text-sm">
        <p>© 2024 10 Minute Mail. All emails are automatically deleted when they expire.</p>
      </footer>
    </div>
  );
} 