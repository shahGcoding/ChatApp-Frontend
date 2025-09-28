import React, { useState } from "react";
import { registerUser } from "../config/config.js";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { useForm } from "react-hook-form";

export function Signup() {

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const create = async (data) => {
    setLoading(true);
    try {
      const userData = await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      if (userData) {
        navigate("/verify-email");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-center items-center">
      <div className="mx-auto w-full max-w-lg p-10 border border-black/10 rounded-xl bg-gray-100 ">
        <div className="mb-2 flex justify-center">
          <span className="inline-block w-full max-w-[100px]">
            {/* add logo */}
          </span>
        </div>
        <h2 className="mb-10 text-center text-2xl font-bold">
          Create your account
        </h2>
        <p className="mt-2 text-center text-base text-black/60">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-black">
            Sign In
          </Link>
        </p>
        <form onSubmit={handleSubmit(create)} className="space-y-5">
          <div className="space-y-4">
            <Input
              lable="Username"
              type="text"
              placeholder="Enter your username....."
              {...register("username", { required: true })}
            />
            {errors.username && (
              <p className="text-sm text-red-600">Username is required</p>
            )}
            <Input
              lable="Email"
              type="email"
              placeholder="Enter your email....."
              {...register("email", {
                required: true,
                validate: {
                  matchPattern: (value) =>
                    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                    "Email address must be valid",
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-600">Email is required</p>
            )}
            <Input
              lable="Password"
              type="password"
              placeholder="Enter your password....."
              {...register("password", { required: true, minLength: 6 })}
            />
            {errors.password && errors.password.type === "required" && (
              <p className="text-sm text-red-600">Password is required</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full hover:cursor-pointer"
            >
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
