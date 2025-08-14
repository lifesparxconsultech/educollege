import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const ChangePassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Supabase automatically processes the token in the URL
    // and signs in the user if it's a recovery link.
    // You can access the user session with supabase.auth.getUser()
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!data.session || error) {
        setError('Invalid or expired reset link.');
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsUpdating(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setIsUpdating(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset successfully! You can now log in.');
    }

    setIsUpdating(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center mb-4">Reset Your Password</h2>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {message && <div className="text-green-600 mb-4">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
          />
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="btn-primary w-full disabled:opacity-50"
        >
          {isUpdating ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};


export default ChangePassword;
