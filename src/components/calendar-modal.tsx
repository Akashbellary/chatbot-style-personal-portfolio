'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useForm, ValidationError } from '@formspree/react';

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
  
  // Formspree integration - replace "xdkwebgr" with your actual form ID
  const [state, handleSubmit] = useForm("xdkwebgr");

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

  // Create composed message with date
  const composedMessage = `Date: ${months[selectedMonth]} ${selectedDate}, ${selectedYear}\n\n${message}`;

  // Show success message if form was submitted successfully
  if (state.succeeded) {
    return (
      <div onClick={() => setIsOpen(true)}>
        {trigger}
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
                className={`w-full max-w-md rounded-2xl p-8 text-center ${
                  theme === 'dark' 
                    ? 'bg-gray-900 border border-gray-600' 
                    : 'bg-white border border-gray-200'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <p className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Thanks! Your message has been sent.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

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

                {/* Debug info for development */}
                <div className="bg-red-100 border border-red-300 p-3 mb-4 rounded">
                  <pre className="text-xs">
                    State: {JSON.stringify(state, null, 2)}
                  </pre>
                </div>

                {/* Error display */}
                {state.errors && state.errors.length > 0 && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
                    <strong>Errors:</strong>
                    <ul>
                      {state.errors.map((error, index) => (
                        <li key={index}>{error.message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Form section */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="hidden" name="date" value={`${months[selectedMonth]} ${selectedDate}, ${selectedYear}`} />
                  
                  <div className="flex items-center gap-3">
                    <label className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      From:
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      placeholder="Who are you? Type your email here"
                      required
                      className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <ValidationError 
                      prefix="Email" 
                      field="email"
                      errors={state.errors}
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <label className={`text-sm font-medium mt-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Message:
                    </label>
                    <div className="flex-1">
                      <textarea
                        id="message"
                        name="message"
                        value={composedMessage}
                        onChange={(e) => {
                          const datePrefix = `Date: ${months[selectedMonth]} ${selectedDate}, ${selectedYear}\n\n`;
                          const newMessage = e.target.value.replace(datePrefix, '');
                          setMessage(newMessage);
                        }}
                        placeholder="What do you want to discuss with Akash on this date?"
                        rows={3}
                        required
                        className={`w-full px-3 py-2 rounded-lg border resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        style={{ minHeight: '80px' }}
                      />
                      <ValidationError 
                        prefix="Message" 
                        field="message"
                        errors={state.errors}
                      />
                    </div>
                  </div>

                  {/* Send button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={state.submitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {state.submitting ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </form>

                {/* Development notice */}
                <p className={`text-xs text-center ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Calendar messages are sent via Formspree. Check debug info above for submission status.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CalendarModal;