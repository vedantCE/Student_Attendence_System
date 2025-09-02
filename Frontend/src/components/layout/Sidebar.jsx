import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  User, 
  BookOpen, 
  Bell,
  Users
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { cn } from '../../lib/utils';

const studentLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/attendance-history', icon: History, label: 'Attendance History' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const facultyLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/classes', icon: BookOpen, label: 'My Classes' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/reports', icon: Users, label: 'Reports' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === 'student' ? studentLinks : facultyLinks;

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 bg-white shadow-sm border-r border-gray-200 h-screen"
    >
      <div className="p-6">
        <nav className="space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <link.icon className="h-5 w-5" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </motion.aside>
  );
}