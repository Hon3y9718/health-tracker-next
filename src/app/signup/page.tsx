import { SignupForm } from "@/components/forms/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Create an account</h1>
      <SignupForm />
    </div>
  );
}
