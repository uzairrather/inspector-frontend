import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from '@/constants/config';

export default function RegisterForm() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', company: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' }); // Clear error on input change
  };

  const validate = () => {
    const newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (form.fullName.length < 3) newErrors.fullName = 'Full name must be at least 3 characters';

    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) newErrors.email = 'Invalid email format';

    if (!form.password.trim()) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!form.company.trim()) newErrors.company = 'Company name is required';
    else if (form.company.length < 2) newErrors.company = 'Company name must be at least 2 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data.message = 'Unexpected response format';
      }

      if (res.ok) {
        toast.success(t('signupSuccessDesc') || 'Registered successfully');
        setForm({ fullName: '', email: '', password: '', company: '' });
        navigate('/login');
      } else {
        toast.error(data.message || data.error || 'Registration failed');
        
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
      className="max-w-md w-full mx-auto space-y-6 p-6 bg-white dark:bg-zinc-900 rounded-4xl shadow-2xl"
    >
      <h2 className="text-xl font-semibold">{t('signupTitle')}</h2>
      {/* <p className="text-gray-500 dark:text-gray-300">{t('signupDesc')}</p> */}

      <div className="space-y-2">
        <Label>{t('fullName') || 'Full Name'}</Label>
        <Input
          name="fullName"
          placeholder="Your Full Name"
          value={form.fullName}
          onChange={handleChange}
          required
        />
        {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
      </div>

      <div className="space-y-2">
        <Label>{t('emailLabel')}</Label>
        <Input
          type="email"
          name="email"
          placeholder="Your E-mail"
          value={form.email}
          onChange={handleChange}
          required
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label>{t('passwordLabel')}</Label>
        <Input
          type="password"
          name="password"
          placeholder="Your Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <Label>{t('companyNameLabel')}</Label>
        <Input
          name="company"
          placeholder="Your Company Name"
          value={form.company}
          onChange={handleChange}
          required
        />
        {errors.company && <p className="text-red-500 text-sm">{errors.company}</p>}
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? t('saving') || 'Saving...' : t('signupButton')}
      </Button>
    </form>
  );
}
