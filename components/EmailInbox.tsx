'use client';

import { useState } from 'react';
import { Mail, Paperclip, Eye, User, Clock, FileText } from 'lucide-react';
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
      onEmailRead(email.id);
      
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
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-12 h-12 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-400 text-sm font-medium">Loading messages...</p>
          <p className="text-gray-500 text-xs mt-1">Checking for new emails</p>
        </div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center mx-auto">
            <Mail className="w-10 h-10 text-gray-500" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl" />
        </div>
        <h4 className="text-xl font-semibold text-white mb-3">Inbox Empty</h4>
        <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
          Messages will appear here instantly when someone sends to your temporary email address
        </p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-5 gap-4 h-[400px]">
      {/* Email List */}
      <div className="lg:col-span-2">
        <div className="glass-card-minimal overflow-hidden h-full">
          <div className="px-4 py-2 border-b border-white/5">
            <h4 className="text-xs font-semibold text-white">
              Messages ({emails.length})
            </h4>
          </div>
          
          <div className="overflow-y-auto h-[360px]">
            {emails.map((email, index) => (
              <div
                key={email.id}
                onClick={() => handleEmailClick(email)}
                className={`p-3 border-b border-white/5 cursor-pointer transition-all duration-300 hover:bg-white/5 ${
                  selectedEmail?.id === email.id 
                    ? 'bg-blue-500/10 border-l-2 border-l-blue-400' 
                    : ''
                } ${!email.isRead ? 'bg-white/5' : ''}`}
              >
                <div className="flex items-start gap-2">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {email.from.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {!email.isRead && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-white truncate">
                        {email.from.split('@')[0]}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(email.receivedAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-xs font-medium text-gray-300 truncate mb-1">
                      {email.subject || '(No Subject)'}
                    </p>
                    
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {email.textContent.substring(0, 60)}...
                    </p>
                    
                    {email.attachments.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Paperclip className="w-2 h-2 text-gray-400" />
                        <span className="text-xs text-gray-400">{email.attachments.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="lg:col-span-3">
        <div className="glass-card-minimal overflow-hidden h-full">
          {selectedEmail ? (
            <div className="h-full flex flex-col">
              {/* Email Header */}
              <div className="p-4 border-b border-white/5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {selectedEmail.from.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white mb-1 leading-tight">
                      {selectedEmail.subject || '(No Subject)'}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="truncate">{selectedEmail.from}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(selectedEmail.receivedAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedEmail.attachments.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg">
                    <Paperclip className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-gray-300">
                      {selectedEmail.attachments.length} attachment{selectedEmail.attachments.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Email Body */}
              <div className="flex-1 overflow-y-auto p-4">
                {selectedEmail.htmlContent ? (
                  <div 
                    className="prose prose-sm max-w-none prose-invert text-gray-300 text-xs"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.htmlContent }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap text-xs text-gray-300 leading-relaxed">
                    {selectedEmail.textContent}
                  </div>
                )}

                {/* Attachments */}
                {selectedEmail.attachments.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      Attachments
                    </h4>
                    <div className="space-y-2">
                      {selectedEmail.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 glass-card-minimal hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <div className="p-1 bg-blue-500/20 rounded-lg">
                            <Paperclip className="w-3 h-3 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">{attachment.filename}</p>
                            <p className="text-xs text-gray-400">
                              {(attachment.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-6 h-6 text-gray-500" />
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">Select a Message</h4>
                <p className="text-gray-400 text-xs">
                  Choose an email to view its contents
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 