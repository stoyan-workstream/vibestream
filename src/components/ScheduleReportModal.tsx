"use client";

import { useState } from "react";
import { X, Calendar, Clock, Mail, Users, Check } from "lucide-react";

interface ScheduleReportModalProps {
  reportName: string;
  onClose: () => void;
  onSave: (schedule: ScheduleConfig) => void;
  existingSchedule?: ScheduleConfig;
}

export interface ScheduleConfig {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  time: string;
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  monthOfYear?: number; // 1-12 for yearly
  recipients: string[];
  format: "csv" | "xlsx" | "pdf";
  includeCharts: boolean;
  timezone: string;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
];

export default function ScheduleReportModal({
  reportName,
  onClose,
  onSave,
  existingSchedule,
}: ScheduleReportModalProps) {
  const [enabled, setEnabled] = useState(existingSchedule?.enabled ?? true);
  const [frequency, setFrequency] = useState<ScheduleConfig["frequency"]>(
    existingSchedule?.frequency ?? "monthly"
  );
  const [time, setTime] = useState(existingSchedule?.time ?? "09:00");
  const [dayOfWeek, setDayOfWeek] = useState(existingSchedule?.dayOfWeek ?? 1);
  const [dayOfMonth, setDayOfMonth] = useState(existingSchedule?.dayOfMonth ?? 1);
  const [monthOfYear, setMonthOfYear] = useState(existingSchedule?.monthOfYear ?? 1);
  const [recipients, setRecipients] = useState<string[]>(existingSchedule?.recipients ?? []);
  const [newRecipient, setNewRecipient] = useState("");
  const [format, setFormat] = useState<ScheduleConfig["format"]>(existingSchedule?.format ?? "xlsx");
  const [includeCharts, setIncludeCharts] = useState(existingSchedule?.includeCharts ?? true);
  const [timezone, setTimezone] = useState(existingSchedule?.timezone ?? "America/New_York");

  const handleAddRecipient = () => {
    const email = newRecipient.trim();
    if (email && !recipients.includes(email) && email.includes("@")) {
      setRecipients([...recipients, email]);
      setNewRecipient("");
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email));
  };

  const handleSave = () => {
    onSave({
      enabled,
      frequency,
      time,
      dayOfWeek: frequency === "weekly" ? dayOfWeek : undefined,
      dayOfMonth: frequency === "monthly" ? dayOfMonth : undefined,
      monthOfYear: frequency === "yearly" ? monthOfYear : undefined,
      recipients,
      format,
      includeCharts,
      timezone,
    });
    onClose();
  };

  const getScheduleSummary = () => {
    if (!enabled) return "Schedule disabled";

    let summary = `Runs ${frequency}`;
    
    if (frequency === "weekly") {
      summary += ` on ${DAYS_OF_WEEK[dayOfWeek]}`;
    } else if (frequency === "monthly") {
      summary += ` on day ${dayOfMonth}`;
    } else if (frequency === "yearly") {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      summary += ` on ${monthNames[monthOfYear - 1]} ${dayOfMonth}`;
    }
    
    summary += ` at ${time}`;
    return summary;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Schedule Report</h2>
            <p className="text-sm text-gray-500 mt-0.5">{reportName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${enabled ? "bg-workstream-blue" : "bg-gray-300"}`}>
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Scheduled Delivery</h3>
                <p className="text-xs text-gray-600">{getScheduleSummary()}</p>
              </div>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? "bg-workstream-blue" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {enabled && (
            <>
              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Frequency</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(["daily", "weekly", "monthly", "quarterly", "yearly"] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setFrequency(freq)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        frequency === freq
                          ? "bg-workstream-blue text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day Selection for Weekly */}
              {frequency === "weekly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Day of Week</label>
                  <div className="grid grid-cols-7 gap-2">
                    {DAYS_OF_WEEK.map((day, index) => (
                      <button
                        key={day}
                        onClick={() => setDayOfWeek(index)}
                        className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                          dayOfWeek === index
                            ? "bg-workstream-blue text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Day Selection for Monthly */}
              {frequency === "monthly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Day of Month</label>
                  <select
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workstream-blue"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        {day}
                        {day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"} of the month
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Month and Day Selection for Yearly */}
              {frequency === "yearly" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Month</label>
                    <select
                      value={monthOfYear}
                      onChange={(e) => setMonthOfYear(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workstream-blue"
                    >
                      {[
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ].map((month, index) => (
                        <option key={month} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Day</label>
                    <select
                      value={dayOfMonth}
                      onChange={(e) => setDayOfMonth(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workstream-blue"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Time and Timezone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workstream-blue"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workstream-blue"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Recipients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Recipients</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={newRecipient}
                        onChange={(e) => setNewRecipient(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddRecipient()}
                        placeholder="Enter email address..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workstream-blue"
                      />
                    </div>
                    <button
                      onClick={handleAddRecipient}
                      className="px-4 py-2 bg-workstream-blue text-white text-sm font-medium rounded-lg hover:bg-workstream-blue-dark transition-all"
                    >
                      Add
                    </button>
                  </div>
                  {recipients.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                      {recipients.map((email) => (
                        <span
                          key={email}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-full text-sm"
                        >
                          {email}
                          <button
                            onClick={() => handleRemoveRecipient(email)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Format Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["csv", "xlsx", "pdf"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        format === fmt
                          ? "bg-workstream-blue text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Include Charts */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Include Charts & Visualizations</p>
                    <p className="text-xs text-gray-600">Add graphs and charts to the report (PDF only)</p>
                  </div>
                </div>
                <button
                  onClick={() => setIncludeCharts(!includeCharts)}
                  disabled={format !== "pdf"}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    includeCharts && format === "pdf" ? "bg-workstream-blue" : "bg-gray-300"
                  } ${format !== "pdf" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      includeCharts ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={enabled && recipients.length === 0}
            className="inline-flex items-center gap-2 px-6 py-2 bg-workstream-blue text-white font-medium rounded-lg hover:bg-workstream-blue-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <Check className="w-4 h-4" />
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
