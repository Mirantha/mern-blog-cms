import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export default function Register() {
  const { register: signup } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ name, email, password }) => {
    try {
      await signup.mutateAsync({ name, email, password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError("root", { message: err.response?.data?.message || "Registration failed" });
    }
  };

  return (
    <form className="card auth" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2>Create account</h2>

      <input placeholder="Name" {...register("name")} />
      {errors.name && <p className="error">{errors.name.message}</p>}

      <input type="email" placeholder="Email" {...register("email")} />
      {errors.email && <p className="error">{errors.email.message}</p>}

      <input type="password" placeholder="Password" {...register("password")} />
      {errors.password && <p className="error">{errors.password.message}</p>}

      <input type="password" placeholder="Confirm password" {...register("confirm")} />
      {errors.confirm && <p className="error">{errors.confirm.message}</p>}

      {errors.root && <p className="error">{errors.root.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Register"}
      </button>
      <p className="muted">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  );
}