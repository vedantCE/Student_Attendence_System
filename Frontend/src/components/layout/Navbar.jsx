import { motion } from 'framer-motion';
import { LogOut, GraduationCap } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth.jsx';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-sm border-b border-gray-200 px-6 py-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src="/favicon.svg" 
            alt="EduTrack Logo" 
            className="h-16 w-16 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">EduTrack</h1>
            <p className="text-sm text-gray-500">Student Attendance System</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}