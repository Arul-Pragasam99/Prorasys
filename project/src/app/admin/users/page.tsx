'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { 
  ArrowLeft, 
  Users, 
  Loader2, 
  Search,
  CheckCircle,
  XCircle,
  Trash2
} from 'lucide-react';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface User {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  disabled?: boolean;
}

export default function ManageUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'users'));
      const userList = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (uid: string) => {
    try {
      setActionLoading(uid);
      await updateDoc(doc(db, 'users', uid), { emailVerified: true });
      await fetchUsers();
    } catch (error) {
      console.error('Error verifying user:', error);
      alert('Failed to verify user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      setActionLoading(uid);
      await deleteDoc(doc(db, 'users', uid));
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesVerified = filterVerified === 'all' || 
      (filterVerified === 'verified' && user.emailVerified) ||
      (filterVerified === 'pending' && !user.emailVerified);
    return matchesSearch && matchesRole && matchesVerified;
  });

  return (
    <main className="min-h-screen bg-surface text-text-primary overflow-x-hidden">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-20 sm:pt-24 lg:pt-28">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 rounded-lg hover:bg-card transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-text-secondary" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary">Manage Users</h1>
              <p className="text-sm text-text-secondary mt-1">View and manage user accounts</p>
            </div>
          </div>
        </div>

        {/* Filters - Fixed with proper spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {/* Search - Full width on mobile, 2 cols on tablet, 1 col on desktop */}
          <div className="sm:col-span-2 lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
            />
          </div>
          
          {/* Role Filter */}
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-text-secondary">Loading users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <Users className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <p className="text-text-primary font-medium">No users found</p>
            <p className="text-text-secondary text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-surface border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Verified</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Joined</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="border-b border-border hover:bg-card/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                            {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <span className="font-medium text-text-primary text-sm truncate max-w-[120px] sm:max-w-none">
                            {user.displayName || 'Anonymous'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-sm truncate max-w-[150px] sm:max-w-none">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-secondary/10 text-secondary'
                        }`}>
                          {user.role || 'customer'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.emailVerified ? (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success w-fit">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <button
                            onClick={() => handleVerifyUser(user.uid)}
                            disabled={actionLoading === user.uid}
                            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning hover:bg-warning/20 transition-colors disabled:opacity-50 w-fit"
                          >
                            <XCircle className="w-3 h-3" />
                            Pending
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-sm">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDeleteUser(user.uid)}
                            disabled={actionLoading === user.uid}
                            className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-surface border-t border-border flex flex-wrap justify-between items-center gap-2 text-sm text-text-secondary">
              <span>Total: {filteredUsers.length} users</span>
              <span className="hidden sm:inline">Showing {filteredUsers.length} of {users.length} users</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}