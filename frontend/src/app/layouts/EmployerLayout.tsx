import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import authService from '@/services/authService';
import { Button } from '@/app/components/ui/button';
import { Building2, Briefcase, Users, Calendar, MessageSquare, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';

export function EmployerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getStoredUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/employer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/employer/jobs', label: 'Job Postings', icon: Briefcase },
    { path: '/employer/applicants', label: 'Applicants', icon: Users },
    { path: '/employer/messages', label: 'Messages', icon: MessageSquare },
    { path: '/employer/company', label: 'Company Profile', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">Employer Portal</h1>
                <p className="text-sm text-gray-500">Manage your hiring process</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-600">Company Account</p>
                <p className="font-semibold text-gray-900">{user?.name}</p>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <aside
            className={`transition-all duration-300 ease-in-out ${
              sidebarOpen ? 'w-60' : 'w-16'
            } flex-shrink-0`}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
              {/* Toggle Button */}
              <div className="p-4 border-b border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="w-full justify-start"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  {sidebarOpen && <span className="ml-2">Collapse</span>}
                </Button>
              </div>

              {/* Navigation Items */}
              <nav className="p-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${
                        isActive
                          ? 'bg-purple-500 text-white'
                          : 'text-gray-700 hover:bg-purple-50'
                      } ${!sidebarOpen && 'justify-center'}`}
                      title={!sidebarOpen ? item.label : ''}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {sidebarOpen && <span className="font-medium">{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-h-[600px]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
