import React from 'react';
import Navbar from '@/components/ui/Navbar';
import LoginForm from '@/components/ui/LoginForm';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      <div className="py-12">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;