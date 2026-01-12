import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-6xl tracking-tight text-gray-900">
          YunoBall
        </h1>
        
        <p className="text-xl text-gray-600 max-w-lg mx-auto">
          A modern debating platform where ideas clash, minds grow, and the best arguments win. 
          Join debates, host discussions, and climb the leaderboards.
        </p>

        <div className="flex gap-4 justify-center pt-4">
          <Button 
            onClick={() => navigate('/login')}
            size="lg"
            variant="default"
            className="cursor-pointer"
          >
            Login
          </Button>
          <Button 
            onClick={() => navigate('/signup')}
            size="lg"
            variant="outline"
            className="cursor-pointer"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}
