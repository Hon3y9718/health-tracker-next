import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <LoginForm />
    </div>
  );
}
