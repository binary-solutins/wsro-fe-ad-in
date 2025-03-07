import React, { useState } from 'react';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Inquiry } from '../types';
import toast from 'react-hot-toast';

interface MailModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
}

export default function MailModal({ isOpen, onClose, inquiry }: MailModalProps) {
  const [emailData, setEmailData] = useState({
    from: 'admin@example.com',
    subject: '',
    message: ''
  });
  const [isEnhancing, setIsEnhancing] = useState(false);

  if (!isOpen || !inquiry) return null;

  const enhanceContent = async (type: 'subject' | 'message') => {
    try {
      setIsEnhancing(true);
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      let prompt = '';
      if (type === 'subject') {
        prompt = `Write a professional email subject line for a response to this customer inquiry: "${inquiry.message}". The response should be brief and professional.`;
      } else {
        prompt = `Write a professional email response to this customer inquiry: "${inquiry.message}". The response should be polite, helpful, and maintain a professional tone. Include a greeting and signature.`;
      }

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      setEmailData(prev => ({
        ...prev,
        [type]: text.trim()
      }));

      toast.success(`${type === 'subject' ? 'Subject' : 'Message'} enhanced successfully`);
    } catch (error) {
      toast.error('Failed to enhance content');
      console.error('AI Enhancement error:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          from: emailData.from,
          to: inquiry.email,
          subject: emailData.subject,
          message: emailData.message,
        }),
      });

      if (!response.ok) throw new Error('Failed to send email');
      
      toast.success('Email sent successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onClose} />
        
        <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900">Compose Email</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">From</label>
                <input
                  type="email"
                  value={emailData.from}
                  onChange={(e) => setEmailData(prev => ({ ...prev, from: e.target.value }))}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">To</label>
                <input
                  type="email"
                  value={inquiry.email}
                  readOnly
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 shadow-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <button
                    type="button"
                    onClick={() => enhanceContent('subject')}
                    disabled={isEnhancing}
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    {isEnhancing ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-1 h-4 w-4" />
                    )}
                    AI Enhance
                  </button>
                </div>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter subject"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <button
                    type="button"
                    onClick={() => enhanceContent('message')}
                    disabled={isEnhancing}
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    {isEnhancing ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-1 h-4 w-4" />
                    )}
                    AI Enhance
                  </button>
                </div>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                  rows={6}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Type your message here..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}