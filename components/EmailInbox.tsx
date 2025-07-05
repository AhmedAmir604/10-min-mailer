'use client';

import { useState } from 'react';
import { Mail, Clock, Paperclip, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Email {
  id: string;
  from: string;
  subject: string;
  textContent: string;
  htmlContent: string;
  receivedAt: string;
  isRead: boolean;
  attachments: any[];
}

interface EmailInboxProps {
  emails: Email[];
  isLoading: boolean;
  onEmailRead: (emailId: string) => void;
}

export default function EmailInbox({ emails, isLoading, onEmailRead }: EmailInboxProps) {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const handleEmailClick = async (email: Email) => {
    setSelectedEmail(email);
    
    if (!email.isRead) {
      // Mark as read
      onEmailRead(email.id);
      
      // Call API to mark as read
      try {
        await fetch(`/api/emails/${encodeURIComponent(email.from)}/${email.id}/read`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Failed to mark email as read:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading emails...</p>
        </div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No Emails Yet</h3>
        <p className="text-gray-500">Your emails will appear here when received.</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4 h-96">
      {/* Email List */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <h3 className="font-medium text-gray-900">Messages ({emails.length})</h3>
        </div>
        <div className="overflow-y-auto h-80">
          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => handleEmailClick(email)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-200' : ''
              } ${!email.isRead ? 'bg-blue-25 font-medium' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!email.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    )}
                    <p className="text-sm text-gray-600 truncate">{email.from}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate mb-1">
                    {email.subject || '(No Subject)'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {email.textContent.substring(0, 100)}...
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(email.receivedAt), { addSuffix: true })}
                  </span>
                  {email.attachments.length > 0 && (
                    <Paperclip className="w-3 h-3 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Content */}
      <div className="border rounded-lg overflow-hidden">
        {selectedEmail ? (
          <div className="h-full flex flex-col">
            {/* Email Header */}
            <div className="bg-gray-50 p-4 border-b">
              <h3 className="font-medium text-gray-900 mb-2">
                {selectedEmail.subject || '(No Subject)'}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>From:</strong> {selectedEmail.from}</p>
                <p><strong>Received:</strong> {formatDistanceToNow(new Date(selectedEmail.receivedAt), { addSuffix: true })}</p>
                {selectedEmail.attachments.length > 0 && (
                  <p><strong>Attachments:</strong> {selectedEmail.attachments.length}</p>
                )}
              </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedEmail.htmlContent ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.htmlContent }}
                />
              ) : (
                <div className="whitespace-pre-wrap text-sm text-gray-700">
                  {selectedEmail.textContent}
                </div>
              )}

              {/* Attachments */}
              {selectedEmail.attachments.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Attachments
                  </h4>
                  <div className="space-y-2">
                    {selectedEmail.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded border"
                      >
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{attachment.filename}</span>
                        <span className="text-xs text-gray-500">
                          ({(attachment.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Select an email to read</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 