"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Icon components
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const MessagesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const SchedulingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ComplianceIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ReportingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ApplicantsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SourcingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const JobPostingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const TalentNetworkIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const TeamIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const EVerifyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const DocumentsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg 
    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const CollapseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
  </svg>
);

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  badge?: number | boolean;
}

const NavItem = ({ href, icon, label, isActive, isCollapsed, badge }: NavItemProps) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
      isActive 
        ? 'bg-gray-600/50 text-white' 
        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
    }`}
  >
    <span className="relative">
      {icon}
      {badge && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#2d3748]" />
      )}
    </span>
    {!isCollapsed && (
      <span className="text-sm font-medium flex-1">{label}</span>
    )}
    {!isCollapsed && typeof badge === 'number' && badge > 0 && (
      <span className="px-1.5 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full min-w-[20px] text-center">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </Link>
);

interface SubNavItemProps {
  href: string;
  label: string;
  isActive?: boolean;
  isCollapsed?: boolean;
}

const SubNavItem = ({ href, label, isActive, isCollapsed }: SubNavItemProps) => (
  <Link
    href={href}
    className={`flex items-center pl-12 pr-4 py-2.5 rounded-lg transition-colors duration-200 ${
      isActive 
        ? 'bg-gray-600/50 text-white' 
        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
    }`}
  >
    {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
  </Link>
);

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [reportingOpen, setReportingOpen] = useState(true);

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } min-h-screen bg-[#2d3748] flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-xl font-bold">≈</span>
        </div>
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <CollapseIcon />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavItem 
          href="/" 
          icon={<HomeIcon />} 
          label="Home" 
          isActive={pathname === '/'} 
          isCollapsed={isCollapsed}
        />
        <NavItem 
          href="/messages" 
          icon={<MessagesIcon />} 
          label="Messages" 
          isActive={pathname === '/messages'} 
          isCollapsed={isCollapsed}
        />
        <NavItem 
          href="/scheduling" 
          icon={<SchedulingIcon />} 
          label="Scheduling" 
          isActive={pathname === '/scheduling'} 
          isCollapsed={isCollapsed}
        />
        {/* <NavItem 
          href="/compliance" 
          icon={<ComplianceIcon />} 
          label="Compliance" 
          isActive={pathname === '/compliance'} 
          isCollapsed={isCollapsed}
          badge={17}
        /> */}
        
        {/* Reporting with submenu */}
        <div>
          <button
            onClick={() => setReportingOpen(!reportingOpen)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors duration-200 ${
              pathname.startsWith('/reporting') 
                ? 'text-white' 
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <ReportingIcon />
              {!isCollapsed && <span className="text-sm font-medium">Reporting</span>}
            </div>
            {!isCollapsed && <ChevronIcon isOpen={reportingOpen} />}
          </button>
          
          {reportingOpen && !isCollapsed && (
            <div className="mt-1 space-y-1">
              <SubNavItem 
                href="/reporting/dashboards" 
                label="Dashboards" 
                isActive={pathname === '/reporting/dashboards'}
                isCollapsed={isCollapsed}
              />
              <SubNavItem 
                href="/reporting/ai-reporting" 
                label="AI Reporting" 
                isActive={pathname === '/reporting/ai-reporting'}
                isCollapsed={isCollapsed}
              />
              <SubNavItem 
                href="/reporting/built-in-reports" 
                label="Built-in Reports" 
                isActive={pathname.startsWith('/reporting/built-in-reports')}
                isCollapsed={isCollapsed}
              />
              <SubNavItem 
                href="/reporting/custom-reports" 
                label="Custom Reports" 
                isActive={pathname === '/reporting/custom-reports'}
                isCollapsed={isCollapsed}
              />
            </div>
          )}
        </div>

        {/* Hiring Section */}
        {!isCollapsed && (
          <div className="pt-6 pb-2 px-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Hiring
            </span>
          </div>
        )}
        
        <NavItem 
          href="/applicants" 
          icon={<ApplicantsIcon />} 
          label="Applicants" 
          isActive={pathname === '/applicants'} 
          isCollapsed={isCollapsed}
        />
        <NavItem 
          href="/sourcing-tools" 
          icon={<SourcingIcon />} 
          label="Sourcing Tools" 
          isActive={pathname === '/sourcing-tools'} 
          isCollapsed={isCollapsed}
        />
        <NavItem 
          href="/job-postings" 
          icon={<JobPostingsIcon />} 
          label="Job Postings" 
          isActive={pathname === '/job-postings'} 
          isCollapsed={isCollapsed}
        />
        <NavItem 
          href="/talent-network" 
          icon={<TalentNetworkIcon />} 
          label="Talent Network" 
          isActive={pathname === '/talent-network'} 
          isCollapsed={isCollapsed}
        />

        {/* Team Management Section */}
        {!isCollapsed && (
          <div className="pt-6 pb-2 px-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Team Management
            </span>
          </div>
        )}
        
        <NavItem 
          href="/team" 
          icon={<TeamIcon />} 
          label="Team" 
          isActive={pathname === '/team'} 
          isCollapsed={isCollapsed}
        />
        <NavItem 
          href="/e-verify" 
          icon={<EVerifyIcon />} 
          label="E-Verify" 
          isActive={pathname === '/e-verify'} 
          isCollapsed={isCollapsed}
        />
        <NavItem 
          href="/documents" 
          icon={<DocumentsIcon />} 
          label="Documents" 
          isActive={pathname === '/documents'} 
          isCollapsed={isCollapsed}
        />
      </nav>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <button 
          onClick={() => setIsCollapsed(false)}
          className="p-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      )}
    </aside>
  );
}
