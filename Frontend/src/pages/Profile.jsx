import { motion } from 'framer-motion';
import { User, Mail, Hash, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth.jsx';

export function Profile() {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Your account information</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your registered details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-lg">{user?.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="text-lg capitalize">{user?.role}</p>
            </div>
          </div>

          {user?.role === 'student' && (
            <div className="flex items-center space-x-3">
              <Hash className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Roll Number</p>
                <p className="text-lg">{user?.rollNo}</p>
              </div>
            </div>
          )}

          {user?.role === 'faculty' && (
            <div className="flex items-center space-x-3">
              <Hash className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Faculty ID</p>
                <p className="text-lg">{user?.facultyId}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}