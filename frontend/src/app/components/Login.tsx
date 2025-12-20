import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this will call your Spring Boot backend API
    // For now, we just simulate a successful login
    onLogin();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight text-gray-900 mb-2">
            YunoBall
          </h1>
          <h2 className="text-2xl text-gray-700">
            Login
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-sm">
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
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Login
          </Button>

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-blue-600 hover:underline"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
