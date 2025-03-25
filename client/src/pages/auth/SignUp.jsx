import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../../features/auth/authactions";
import { clearError } from "../../features/auth/authslices";
import { Scissors, Palette, Droplet, Flower, Brush, Smile } from "lucide-react";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [backgroundIcons, setBackgroundIcons] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

    // Name validation
    if (!formData.name) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

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
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setLoading(true);
      const result = await dispatch(
        signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        })
      );

      setLoading(false);
      navigate("/signin");
      if (!result.success) {
        setErrors({
          form: result.message || "Signup failed. Please try again.",
        });
        setLoading(false);
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
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-[#52b788]">
            Join our Salon Community
          </p>
        </div>

        {/* Error Display */}
        {errors.form && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{errors.form}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#1b4332]"
            >
              Full Name
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Smile className="w-5 h-5 text-[#52b788]" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`
                  w-full pl-10 pr-3 py-2 
                  border rounded-md 
                  ${
                    errors.name
                      ? "border-red-300 focus:ring-red-500"
                      : "border-[#95d5b2] focus:ring-[#52b788]"
                  }
                  focus:outline-none focus:ring-2 focus:border-transparent
                `}
                placeholder="Your Name"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

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

          {/* Confirm Password Input */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-[#1b4332]"
            >
              Confirm Password
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Flower className="w-5 h-5 text-[#52b788]" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`
                  w-full pl-10 py-2 
                  border rounded-md 
                  ${
                    errors.confirmPassword
                      ? "border-red-300 focus:ring-red-500"
                      : "border-[#95d5b2] focus:ring-[#52b788]"
                  }
                  focus:outline-none focus:ring-2 focus:border-transparent
                `}
                placeholder="Repeat Password"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
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
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-[#52b788]">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="font-medium text-[#1b4332] hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
