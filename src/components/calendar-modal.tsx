'use client';

import { useState, useEffect } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';

interface CalendarModalProps {
  trigger: React.ReactNode;
}

const CalendarModal = ({ trigger }: CalendarModalProps) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [fromEmail, setFromEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string>('');
  const [state, handleSubmit] = useForm("xdkwebgr"); // Replace with your Formspree form ID
  const [debugInfo, setDebugInfo] = useState<string>('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = day === selectedDate;
      days.push(
        <motion.button
          key={day}
          onClick={() => setSelectedDate(day)}
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-200 ${
            isSelected
              ? 'border-blue-400 bg-blue-100 text-blue-800 animate-pulse'
              : theme === 'dark'
              ? 'border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {day}
        </motion.button>
      );
    }

    return days;
  };


  // Compose the message to include the selected date
  const composedMessage = `Date: ${months[selectedMonth]} ${selectedDate}, ${selectedYear}\n\n${message}`;

  // Debug: log state changes
  useEffect(() => {
    setDebugInfo(
      `Formspree State:\n` +
      `submitting: ${state.submitting}\n` +
      `succeeded: ${state.succeeded}\n` +
      `errors: ${JSON.stringify(state.errors)}\n` +
      (error ? `Custom Error: ${error}\n` : '')
    );
  }, [state, error]);

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-0 relative ${
                theme === 'dark' 
                  ? 'bg-gray-900 border border-gray-600' 
                  : 'bg-white border border-gray-200'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsOpen(false)}
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-10 ${
                  theme === 'dark'
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <X size={20} />
              </button>

              <div className={`bg-accent w-full space-y-8 rounded-2xl p-8 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                {/* Header */}
                <div className="text-center">
                  <h2 className={`text-2xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Check my availability here
                  </h2>
                </div>

                {/* Calendar Header - Date/Month/Year selectors */}
                <div className="bg-yellow-200 rounded-lg p-4 flex justify-between items-center">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="bg-transparent text-yellow-800 font-semibold focus:outline-none"
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index} className="text-yellow-800">
                        {month}
                      </option>
                    ))}
                  </select>
                  
                  <input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-transparent text-yellow-800 font-semibold w-20 text-center focus:outline-none"
                    min="2020"
                    max="2030"
                  />
                </div>

                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-semibold text-gray-600 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {renderCalendarDays()}
                </div>

                {/* Selected date display */}
                <div className={`text-center p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                } border`}>
                  <p className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Selected: {months[selectedMonth]} {selectedDate}, {selectedYear}
                  </p>
                </div>

                {/* Formspree Contact Form */}
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    setDebugInfo('Submitting form...');
                    setError('');
                    // Log form data
                    const formData = {
                      email: fromEmail,
                      message: composedMessage,
                      date: `${months[selectedMonth]} ${selectedDate}, ${selectedYear}`,
                    };
                    setDebugInfo(prev => prev + '\nForm Data: ' + JSON.stringify(formData));
                    try {
                      // Set textarea to composedMessage before submit
                      setMessage(composedMessage);
                      await handleSubmit(e);
                    } catch (err: any) {
                      setError(err?.message || 'Unknown error');
                    }
                  }}
                  className="space-y-4"
                >
                  {/* Debug info display */}
                  <pre className="text-xs text-red-500 bg-gray-100 p-2 rounded-lg mb-2 whitespace-pre-wrap">{debugInfo}</pre>
                  <div className="flex items-center gap-3">
                    <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>From:</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={fromEmail}
                      onChange={e => setFromEmail(e.target.value)}
                      required
                      placeholder="Who are you? Type your email here"
                      className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    />
                    <ValidationError prefix="Email" field="email" errors={state.errors} />
                  </div>
                  <div className="flex items-start gap-3">
                    <label className={`text-sm font-medium mt-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Message:</label>
                    <textarea
                      id="message"
                      name="message"
                      value={composedMessage}
                      onChange={e => setMessage(e.target.value)}
                      required
                      placeholder="What do you want to discuss with Akash on this date?"
                      rows={3}
                      className={`flex-1 px-3 py-2 rounded-lg border resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                      style={{ minHeight: '80px' }}
                    />
                    <ValidationError prefix="Message" field="message" errors={state.errors} />
                  </div>
                  {/* Hidden field for date */}
                  <input type="hidden" name="date" value={`${months[selectedMonth]} ${selectedDate}, ${selectedYear}`} />
                  <div className="flex justify-end">
                    <button type="submit" disabled={state.submitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      Send
                    </button>
                  </div>
                  {error && (
                    <p className="text-red-600 text-center font-medium">Error: {error}</p>
                  )}
                  {state.succeeded && (
                    <p className={`text-green-600 text-center font-medium`}>Message sent! I'll get back to you soon.</p>
                  )}
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CalendarModal;