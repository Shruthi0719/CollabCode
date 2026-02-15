import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await login(formData.email, formData.password);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-8 sm:px-6 lg:px-8">
      {/* Background accent decorations (dark mode only) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content wrapper with max-width */}
      <div className="w-full max-w-[420px] relative z-10">
        {/* Header section - 32px bottom margin (4 * 8px) */}
        <div className="text-center mb-32">
          {/* Logo - 24px bottom margin (3 * 8px) */}
          <div className="flex justify-center mb-24">
            <Logo size="lg" />
          </div>
          
          {/* Heading - 8px bottom margin */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 tracking-tight">
            Welcome back
          </h1>
          
          {/* Subheading */}
          <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Sign in to your collaborative coding workspace
          </p>
        </div>

        {/* Card container - glassmorphism */}
        <div className="relative">
          {/* Card background with border and blur */}
          <div className="absolute inset-0 bg-white dark:bg-gradient-to-b dark:from-gray-900/40 dark:to-gray-900/20 rounded-2xl border border-gray-200 dark:border-gray-800/50 dark:backdrop-blur-xl" />
          
          {/* Card content */}
          <div className="relative px-8 py-32 sm:px-24">
            {/* Submission error alert - 24px bottom margin */}
            {errors.submit && (
              <div className="mb-24 p-16 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                <div className="flex items-start gap-12">
                  <div className="flex-shrink-0 mt-4">
                    <svg className="w-20 h-20 text-red-600 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-24" noValidate>
              {/* Email field - 24px bottom margin */}
              <div className="space-y-8">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={loading}
                    touched={touched.email}
                    error={errors.email}
                  />
                </div>
              </div>

              {/* Password field - 24px bottom margin */}
              <div className="space-y-8">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={loading}
                    touched={touched.password}
                    error={errors.password}
                  />
                </div>
              </div>

              {/* Submit button - 32px bottom margin */}
              <Button
                type="submit"
                variant="gradient"
                loading={loading}
                disabled={loading}
                fullWidth
                aria-busy={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Divider - 24px top and bottom margin */}
            <div className="mt-24 pt-24 border-t border-gray-200 dark:border-gray-800/50" />

            {/* Sign up link */}
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 rounded px-2 py-1 transition-colors duration-200"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer text - 32px top margin */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-600 mt-32">
          By signing in, you agree to our{' '}
          <a href="#" className="text-gray-600 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 underline transition-colors">
            Terms of Service
          </a>
          {' '}and{' '}
          <a href="#" className="text-gray-600 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 underline transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
