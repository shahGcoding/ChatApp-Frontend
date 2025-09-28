import React, { useState } from "react";
import { verifyEmail } from "../config/config.js";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Input } from "../components/ui/input.js";
import { Button } from "../components/ui/button.js";

export function VerifyEmail() {
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
 
    const create = async (data) => {
  setError("");
  try {

    const verifiedUser = await verifyEmail({
      code: data.code,
    });

    if (verifiedUser) {
      navigate("/login");
    }
  } catch (error) {
    setError(error.response?.data?.message || "Invalid verification code");
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="font-semibold text-xl text-center mb-4">
          Email verification
        </h1>
        <p className="text-sm text-gray-600 text-center mb-4">
          Enter the code sent to your email
        </p>

        {error && <p className="text-red-600 mt-8 text-center">{error}</p>}

        <form onSubmit={handleSubmit(create)} className="space-y-4">
          <Input
            type="text"
            placeholder="Enter verification code..."
            {...register("code", { required: true })}
          />
          <Button
            type="submit"
            className="w-full hover:cursor-pointer text-white"
          >
            verify 
          </Button>
        </form>
      </div>
    </div>
  );
}

//export default VerifyEmail;
