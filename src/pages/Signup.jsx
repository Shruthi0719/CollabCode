import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (pw) => {
    let strength = 0;
    if (pw.length >= 8) strength += 25;
    if (pw.length >= 12) strength += 25;
    if (/[A-Z]/.test(pw)) strength += 25;
    if (/[0-9!@#$%^&*]/.test(pw)) strength += 25;
    return Math.min(strength, 100);
  };

  const getStrengthColor = (strength) => {
    if (strength < 50) return 'bg-red-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = (strength) => {
    if (strength < 50) return 'Weak';
    if (strength < 75) return 'Fair';
    return 'Strong';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
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
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 2) {
      newErrors.username = 'Username must be at least 2 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username must be less than 20 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      email: true,
      username: true,
      password: true,
      confirmPassword: true,
    });
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await signup(formData.email, formData.password, formData.username);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      const errorMessage = err.message || 'Signup failed. Please try again.';
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-8 sm:px-6 lg:px-8">
      {/* Background accent decorations */}
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
            Create account
          </h1>
          
          {/* Subheading */}
          <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Join our collaborative coding workspace
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

              {/* Username field - 24px bottom margin */}
              <div className="space-y-8">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  name="username"
                  autoComplete="username"
                  placeholder="john_doe"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                  touched={touched.username}
                  error={errors.username}
                />
              </div>

              {/* Password field - 24px bottom margin */}
              <div className="space-y-8">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                  touched={touched.password}
                  error={errors.password}
                />
                
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-8">
                      <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-800/50 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700/50">
                        <div
                          className={`h-full transition-all duration-300 ${getStrengthColor(
                            passwordStrength
                          )}`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {getStrengthLabel(passwordStrength)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password field - 24px bottom margin */}
              <div className="space-y-8">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                  touched={touched.confirmPassword}
                  error={errors.confirmPassword}
                />
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
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            {/* Divider - 24px top and bottom margin */}
            <div className="mt-24 pt-24 border-t border-gray-200 dark:border-gray-800/50" />

            {/* Sign in link */}
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 rounded px-2 py-1 transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer text - 32px top margin */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-600 mt-32">
          By creating an account, you agree to our{' '}
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
