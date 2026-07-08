import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '../services/authApi';
import { useAuthStore } from '../stores/authStore';

export const useLogin = () => {
  const loginStore = useAuthStore((state) => state.login);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      loginStore(data.accessToken, data.user);
      queryClient.clear();
      toast.success('Successfully logged in!');
      navigate('/');
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
    },
  });
};

export const useLogout = () => {
  const logoutStore = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
      toast.success('Logged out successfully.');
      navigate('/login');
    },
    onError: () => {
      // Force logout in the client even if server call fails
      logoutStore();
      queryClient.clear();
      navigate('/login');
    },
  });
};


export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (data) => {
      toast.success(data.message || 'If registered, a password recovery link has been sent.');
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Could not process password recovery request.';
      toast.error(message);
    },
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: (data) => {
      toast.success(data.message || 'Password reset successfully! You can now log in.');
      navigate('/login');
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Could not reset password.';
      toast.error(message);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: (data) => {
      toast.success(data.message || 'Password updated successfully.');
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Could not update password.';
      toast.error(message);
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: (data) => {
      toast.success(data.message || 'Email verified successfully!');
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Verification failed.';
      toast.error(message);
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: (data) => {
      toast.success(data.message || 'Verification email resent.');
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to resend verification email.';
      toast.error(message);
    },
  });
};

export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: authApi.listSessions,
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  const logoutStore = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.revokeSession,
    onSuccess: (data, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session terminated successfully.');
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Could not terminate session.';
      toast.error(message);
    },
  });
};

export const useLogoutAll = () => {
  const queryClient = useQueryClient();
  const logoutStore = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logoutAll,
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
      toast.success('All sessions terminated. Please sign in again.');
      navigate('/login');
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Could not terminate sessions.';
      toast.error(message);
    },
  });
};
