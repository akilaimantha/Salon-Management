import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../features/auth/authactions";
import { clearError } from "../../features/auth/authslices";
import { Scissors, Palette, Droplet, Flower, Brush, Smile } from "lucide-react";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [backgroundIcons, setBackgroundIcons] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  // Animated background icons
  useEffect(() => {
    const generateBackgroundIcons = () => {
      const icons = [Scissors, Palette, Droplet, Flower, Brush, Smile];
      const newBackgroundIcons = Array(15)
        .fill()
        .map(() => ({
          Icon: icons[Math.floor(Math.random() * icons.length)],
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 5,
          duration: Math.random() * 5 + 3,
          size: Math.random() * 30 + 20,
        }));
      setBackgroundIcons(newBackgroundIcons);
    };

    generateBackgroundIcons();
  }, []);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      const result = await dispatch(
        login(
          {
            email: formData.email,
            password: formData.password,
          },
          navigate
        )
      );

      if (!result.success) {
        setErrors({
          form: result.message || "Login failed. Please try again.",
        });
      }
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <div className="relative min-h-screen bg-[#d8f3dc] flex items-center justify-center overflow-hidden">
      {/* Animated Background Icons */}
      {backgroundIcons.map((item, index) => (
        <div
          key={index}
          className="absolute opacity-30 animate-float"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
          }}
        >
          <item.Icon size={item.size} className="text-[#52b788]" />
        </div>
      ))}

      <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-[#1b4332]">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-[#52b788]">Sign in to your account</p>
        </div>

        {/* Error Display */}
        {errors.form && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{errors.form}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#1b4332]"
            >
              Email Address
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Droplet className="w-5 h-5 text-[#52b788]" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`
                  w-full pl-10 pr-3 py-2 
                  border rounded-md 
                  ${
                    errors.email
                      ? "border-red-300 focus:ring-red-500"
                      : "border-[#95d5b2] focus:ring-[#52b788]"
                  }
                  focus:outline-none focus:ring-2 focus:border-transparent
                `}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#1b4332]"
            >
              Password
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Scissors className="w-5 h-5 text-[#52b788]" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className={`
                  w-full pl-10 pr-10 py-2 
                  border rounded-md 
                  ${
                    errors.password
                      ? "border-red-300 focus:ring-red-500"
                      : "border-[#95d5b2] focus:ring-[#52b788]"
                  }
                  focus:outline-none focus:ring-2 focus:border-transparent
                `}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <Brush className="w-5 h-5 text-[#52b788]" />
                ) : (
                  <Palette className="w-5 h-5 text-[#52b788]" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <a href="#" className="text-sm text-[#1b4332] hover:underline">
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3 
                bg-[#52b788] text-white 
                rounded-md 
                hover:bg-[#1b4332] 
                focus:outline-none 
                focus:ring-2 focus:ring-[#95d5b2]
                transition-colors duration-300
                disabled:opacity-50
              "
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>

        {/* Social Login Section */}
        <div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#95d5b2]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#52b788]">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              className="
                w-full py-2 
                border border-[#95d5b2] 
                rounded-md 
                text-[#1b4332] 
                hover:bg-[#d8f3dc]
                flex items-center justify-center
              "
            >
              <Smile className="w-5 h-5 mr-2" /> Google
            </button>
            <button
              className="
                w-full py-2 
                border border-[#95d5b2] 
                rounded-md 
                text-[#1b4332] 
                hover:bg-[#d8f3dc]
                flex items-center justify-center
              "
            >
              <Flower className="w-5 h-5 mr-2" /> Facebook
            </button>
          </div>
        </div>

        {/* Signup Link */}
        <div className="text-center">
          <p className="text-sm text-[#52b788]">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-[#1b4332] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
