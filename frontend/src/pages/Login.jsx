import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Login attempt with:', email);

        try {
            const user = await login(email, password);
            console.log('Login successful, user:', user);
            console.log('User role:', user?.role);

            // Redirect based on role
            if (user?.role === 'student') {
                console.log('Navigating to student dashboard');
                navigate('/student/dashboard');
            } else if (user?.role === 'teacher') {
                console.log('Navigating to teacher dashboard');
                navigate('/teacher/dashboard');
            } else if (user?.role === 'parent') {
                console.log('Navigating to parent dashboard');
                navigate('/parent/dashboard');
            } else {
                console.log('Unknown role, navigating to home');
                navigate('/');
            }
        } catch (err) {
            console.error('Login failed:', err);
            console.error('Error details:', err.response?.data);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold text-center">Welcome Back</CardTitle>
                    <CardDescription className="text-center">
                        Sign in to your account to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>

                        <div className="text-center text-sm text-slate-600">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                className="text-primary hover:underline font-medium"
                            >
                                Register
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
