import React, { useState } from 'react';
import LoginForm from '@/components/Auth/LoginForm';
import RegisterForm from '@/components/Auth/RegisterForm';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);

    const switchToRegister = () => setIsLogin(false);
    const switchToLogin = () => setIsLogin(true);

    return (
        <>
            {isLogin ? (
                <LoginForm onSwitchToRegister={switchToRegister} />
            ) : (
                <RegisterForm onSwitchToLogin={switchToLogin} />
            )}
        </>
    );
};

export default AuthPage;