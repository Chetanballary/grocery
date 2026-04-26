import { SignIn } from "@clerk/react";
import { basePath } from "@/lib/auth";

export default function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-green-50 via-stone-50 to-amber-50 px-4 py-12">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/onboarding`}
      />
    </div>
  );
}
