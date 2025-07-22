import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/constants/config';

export default function LoginForm() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  const validate = () => {
  if (!email.trim()) {
    toast.error('Email is required');
    return false;
  }
  if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    toast.error('Invalid email format');
    return false;
  }
  if (!password.trim()) {
    toast.error('Password is required');
    return false;
  }
  if (password.length < 6) {
    toast.error('Password must be at least 6 characters');
    return false;
  }
  return true;
};


  const handleSubmit = async (e) => {
    if (!validate()) return;

    e.preventDefault();
    setLoading(true);
    try {
      console.log(`${API_BASE_URL}/api/auth/login`)
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data.message = 'Unexpected response format';
      }

      if (res.ok) {
        toast.success(t('loginSuccess') || 'Logged in successfully');

        // 🧠 Optionally store the token
        localStorage.setItem('token', data.token);

        // ✅ Redirect to company selection
        navigate('/select-company');
      } else {
        toast.error(data.message || data.error || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      dir={dir}
      className="max-w-md w-full mx-auto space-y-6 bg-white p-6 rounded-4xl shadow-2xl"
    >
      <h2 className="text-xl font-semibold">{t('loginTitle')}</h2>
      {/* <p className="text-gray-500">{t('loginDesc')}</p> */}

      <div className="space-y-2">
        <Label>{t('emailLabel')}</Label>
        <Input
          type="email"
          value={email}
          placeholder="Your E-Mail"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>{t('passwordLabel')}</Label>
        <Input
          type="password"
          placeholder="Your Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? t('saving') || 'Logging in...' : t('loginButton')}
      </Button>
    </form>
  );
}
