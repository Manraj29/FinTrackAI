import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import loginImage from "../assets/login.png";
import signupImage from "../assets/signup.png";

export default function LoginPage() {
    const { login, signInWithGoogle } = useAuth();
    const { signup } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true); // State to toggle between login and signup

    // if the user is already logged in, redirect to the dashboard
    React.useEffect(() => {
        const currentUser = localStorage.getItem("currentUser");
        if (currentUser) {
            navigate("/chat");
        }
    }, [navigate]);

    async function handleSubmit(e) {
        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        // if signup

        e.preventDefault();
        setError("");
        if (!isLogin) {
            // Handle signup logic here
            try {
                await signup(email, password);
                alert("Verification email sent. Please verify your email before login.");
                navigate("/");
            } catch (err) {
                setError(err.message);
            }
            return;
        }

        try {
            await login(email, password);
            localStorage.setItem("currentUser", JSON.stringify({ email })); // Store user info in localStorage
            navigate("/chat");
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleGoogleLogin() {
        setError("");
        try {
            await signInWithGoogle();
            localStorage.setItem("currentUser", JSON.stringify({ email })); // Store user info in localStorage
            navigate("/chat");
        } catch (err) {
            setError(err.message);
        }
    }

    
    // Error message timeout
    React.useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <>
            <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-[#455a64] to-[#ff725e] text-white">
                {/* Auth Container */}
                <div className={`max-w-5xl bg-white text-black rounded-xl shadow-lg overflow-hidden flex transition-all duration-900 ${window.innerWidth < 768 ? 'flex-col p-3 w-[400px]' : 'flex-row w-full'}`}>
                    {/* Form Section if in mobile view dont show the image */}
                    <div className={`flex flex-col justify-center items-center ${window.innerWidth < 768 ? 'w-full p-5' : 'w-1/2 p-10 '}`}>
                        {isLogin ? <h2 className="text-3xl font-semibold mb-6 tracking-wide text-[#263238]">Login to <span className="text-[#b35042] text-4xl">FinTrackAI</span></h2> : <h2 className="text-3xl font-semibold mb-6 tracking-wide text-[#263238]">Sign-up to <span className="text-[#b35042] text-4xl">FinTrackAI</span></h2>}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input
                                className="w-full bg-transparent text-center border-b border-[#ff725e] focus:outline-none text-lg py-2  transition-all focus:border-[#ff725e] text-[#455a64]"
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                className="w-full bg-transparent text-center border-b border-[#ff725e] focus:outline-none text-lg py-2  transition-all focus:border-[#ff725e] text-[#455a64]"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {/* {!isLogin && (
                                <input
                                    className="w-full bg-transparent text-center border-b border-[#ff725e] focus:outline-none text-lg py-2  transition-all focus:border-[#ff725e] text-[#455a64]"
                                    type="text"
                                    placeholder="Username"
                                    value={password}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            )} */}
                            <button className="w-full bg-[#ff725e] hover:bg-[#b35042] text-white p-3 rounded cursor-pointer transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ff725e] focus:ring-opacity-50"
                                type="submit">
                                {isLogin ? 'Login' : 'Sign Up'}
                            </button>

                        </form>
                        <button
                            onClick={handleGoogleLogin}
                            className="mt-6 py-3 text-blue-300 w-fit mx-auto cursor-pointer transition-all duration-300 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-[#ff725e] focus:ring-opacity-50"
                        >
                            <img
                                src="https://static.vecteezy.com/system/resources/previews/022/613/027/non_2x/google-icon-logo-symbol-free-png.png"
                                alt="Google icon"
                                className="w-7 h-7 justify-center mx-auto"
                            />
                        </button>

                        <p className="mt-4 text-sm text-center">
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                            <button
                                className="text-blue-600 hover:underline transition-all duration-300 focus:outline-none cursor-pointer"
                                onClick={() => setIsLogin(!isLogin)}
                            >
                                {isLogin ? 'Sign Up' : 'Login'}
                            </button>
                        </p>
                    </div>

                    {/* Image Section */}
                    <div className={`w-1/2 relative overflow-hidden ${window.innerWidth < 768 ? 'hidden' : 'block'}`}>
                        <img
                            src={isLogin ? loginImage : signupImage}
                            alt={isLogin ? 'Login Illustration' : 'Signup Illustration'}
                            className="h-full w-full object-cover transition-all duration-700"
                        />
                    </div>
                </div>
                {/* Error Message */}
                {error && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg transition-all duration-300">
                        {error}
                    </div>
                )}
            </div>
        </>
    );
}
