import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SignupProps {
  onSignup: () => void;
}

export default function Signup({ onSignup }: SignupProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this will call your Spring Boot backend API
    // Add password validation here
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onSignup();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight text-gray-900 mb-2">
            YunoBall
          </h1>
          <h2 className="text-2xl text-gray-700">
            Create Account
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Sign Up
          </Button>

          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:underline"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
