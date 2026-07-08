import React from 'react';
import { 
  Laptop, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Globe, 
  Trash2, 
  Loader2, 
  ShieldAlert, 
  History, 
  LockKeyhole, 
  SmartphoneNfc,
  CheckCircle2
} from 'lucide-react';
import { useSessions, useRevokeSession, useLogoutAll } from '../hooks/useAuthMutations';
import { toast } from 'sonner';

const parseUserAgent = (userAgent) => {
  if (!userAgent) {
    return { device: 'Web Client', deviceIcon: Laptop, browser: 'Web Browser' };
  }

  let device = 'Web Client';
  let deviceIcon = Laptop;
  
  if (/iPhone/i.test(userAgent)) {
    device = 'iPhone';
    deviceIcon = Smartphone;
  } else if (/iPad/i.test(userAgent)) {
    device = 'iPad';
    deviceIcon = Tablet;
  } else if (/Android/i.test(userAgent)) {
    device = 'Android Device';
    deviceIcon = Smartphone;
  } else if (/Windows/i.test(userAgent)) {
    device = 'Windows Workstation';
    deviceIcon = Monitor;
  } else if (/Macintosh/i.test(userAgent)) {
    device = 'MacBook Pro';
    deviceIcon = Laptop;
  } else if (/Linux/i.test(userAgent)) {
    device = 'Linux Workstation';
    deviceIcon = Monitor;
  }

  let browser = 'Web Browser';
  if (/Chrome/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/Firefox/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/Edge/i.test(userAgent)) {
    browser = 'Microsoft Edge';
  }

  return { device, deviceIcon, browser };
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  // Format as date
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const Sessions = () => {
  const { data: sessions, isLoading, isError, refetch } = useSessions();
  const revokeSessionMutation = useRevokeSession();
  const logoutAllMutation = useLogoutAll();

  const handleRevoke = (sessionId) => {
    if (window.confirm('Are you sure you want to terminate this session?')) {
      revokeSessionMutation.mutate(sessionId);
    }
  };

  const handleLogoutAll = () => {
    if (window.confirm('DANGER: This will logout all devices including this one. Do you wish to continue?')) {
      logoutAllMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#c4c7c8]">
        <Loader2 className="h-10 w-10 animate-spin text-[#abc7ff] mb-4" />
        <p className="font-mono text-sm uppercase tracking-wider">Retrieving Active Sessions...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-[#ffb4ab]" />
        <h3 className="font-sans text-[20px] font-semibold text-white">Could not load sessions</h3>
        <p className="text-[#c4c7c8] max-w-sm text-sm">
          There was an error communicating with the security gateway. Please try reloading.
        </p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 bg-white text-[#2f3131] rounded-full text-sm font-semibold tracking-wide hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          Reload Sessions
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 select-none">
      
      {/* Header Actions Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="font-mono text-[12px] tracking-widest text-[#abc7ff] uppercase">
            Active Access Points
          </p>
          <h3 className="font-sans text-[32px] font-bold text-white tracking-tight leading-tight">
            Manage your active sessions
          </h3>
          <p className="text-[#c4c7c8] text-[15px] leading-relaxed max-w-xl">
            Review and manage all devices currently logged into your admin account. If you don't recognize a session, terminate it immediately.
          </p>
        </div>
        <button
          onClick={handleLogoutAll}
          disabled={logoutAllMutation.isPending}
          className="px-6 py-3 border border-[#ffb4ab] text-[#ffb4ab] hover:bg-[#ffb4ab]/10 rounded-full font-sans text-[14px] font-semibold transition-all flex items-center gap-2 group active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
          Logout all devices
        </button>
      </div>

      {/* Session List Table */}
      <div className="bg-[#201f1f]/60 backdrop-blur-[12px] rounded-[1rem] border border-[#444748]/30 overflow-hidden shadow-2xl relative">
        
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#abc7ff] to-transparent opacity-50"></div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#444748]/30 bg-[#2a2a2a]/50">
                <th className="px-6 py-4 font-mono text-[11px] text-[#c4c7c8] uppercase tracking-wider">Device</th>
                <th className="px-6 py-4 font-mono text-[11px] text-[#c4c7c8] uppercase tracking-wider">Browser</th>
                <th className="px-6 py-4 font-mono text-[11px] text-[#c4c7c8] uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-4 font-mono text-[11px] text-[#c4c7c8] uppercase tracking-wider">Last Activity</th>
                <th className="px-6 py-4 font-mono text-[11px] text-[#c4c7c8] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#444748]/20">
              {sessions?.map((session) => {
                const { device, deviceIcon: DeviceIcon, browser } = parseUserAgent(session.userAgent);
                return (
                  <tr key={session.sessionId} className="hover:bg-[#353534]/40 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${session.isCurrent ? 'bg-[#abc7ff]/10 text-[#abc7ff]' : 'bg-[#353534] text-[#c4c7c8]'}`}>
                          <DeviceIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-sans text-[16px] font-semibold text-white">{device}</span>
                            {session.isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-[#34A853]/20 text-[#34A853] text-[9px] font-bold uppercase tracking-tight inline-flex items-center gap-1">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                This Device
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#c4c7c8] font-mono tracking-wide">{session.deviceId.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <Globe className="h-4 w-4 text-[#abc7ff] opacity-80" />
                        <span>{browser}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs text-[#c4c7c8]">{session.ipAddress}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs text-[#c4c7c8]">
                        {session.isCurrent ? 'Active Now' : formatTimeAgo(session.lastAccessedAt)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {session.isCurrent ? (
                        <span className="text-[#c4c7c8]/40 italic text-xs font-mono">Current Session</span>
                      ) : (
                        <button
                          onClick={() => handleRevoke(session.sessionId)}
                          disabled={revokeSessionMutation.isPending}
                          className="text-[#ffb4ab] font-sans text-xs font-semibold hover:underline decoration-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          Logout session
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div className="bg-[#201f1f]/60 backdrop-blur-[12px] border border-[#444748]/30 p-6 rounded-[1rem] space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-[#abc7ff]/10 flex items-center justify-center text-[#abc7ff]">
            <SmartphoneNfc className="h-6 w-6" />
          </div>
          <h4 className="font-sans text-[18px] font-semibold text-white">Two-Factor Authentication</h4>
          <p className="text-sm text-[#c4c7c8] leading-relaxed">
            2FA is currently enabled via Authenticator App. This adds an extra layer of security to your admin account.
          </p>
          <button className="text-[#abc7ff] font-sans text-sm font-semibold hover:underline cursor-pointer">
            Manage Settings
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-[#201f1f]/60 backdrop-blur-[12px] border border-[#444748]/30 p-6 rounded-[1rem] space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-[#34A853]/10 flex items-center justify-center text-[#34A853]">
            <History className="h-6 w-6" />
          </div>
          <h4 className="font-sans text-[18px] font-semibold text-white">Login History</h4>
          <p className="text-sm text-[#c4c7c8] leading-relaxed">
            Review a full history of all login attempts, including failed ones and their geographic locations.
          </p>
          <button className="text-[#abc7ff] font-sans text-sm font-semibold hover:underline cursor-pointer">
            View Full Log
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-[#201f1f]/60 backdrop-blur-[12px] border border-[#444748]/30 p-6 rounded-[1rem] space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-[#ffb4ab]/10 flex items-center justify-center text-[#ffb4ab]">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h4 className="font-sans text-[18px] font-semibold text-white">Password Policy</h4>
          <p className="text-sm text-[#c4c7c8] leading-relaxed">
            Your password was last changed 42 days ago. We recommend rotating your admin password every 90 days.
          </p>
          <button className="text-[#abc7ff] font-sans text-sm font-semibold hover:underline cursor-pointer">
            Update Password
          </button>
        </div>

      </div>

    </div>
  );
};
