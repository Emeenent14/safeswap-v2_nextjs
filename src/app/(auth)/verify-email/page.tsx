import { Suspense } from "react";
import type { Metadata } from "next";
import AuthLayout from "@/components/layout/AuthLayout";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Verify Email | SafeSwap",
  description:
    "Verify your email address to complete your SafeSwap account setup and start making secure transactions.",
  robots: {
    index: false,
    follow: false,
  },
};

interface VerifyEmailPageProps {
  searchParams: {
    token?: string;
  };
}

function VerifyEmailFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-3 w-40 mx-auto" />
      </div>

      <Skeleton className="h-10 w-full" />

      <div className="text-center space-y-3">
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="text-center space-y-2">
        <Skeleton className="h-3 w-56 mx-auto" />
        <Skeleton className="h-3 w-44 mx-auto" />
      </div>
    </div>
  );
}

export default function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const token = searchParams.token;

  // ✅ Guard against undefined tokens
  if (!token) {
    return (
      <AuthLayout
        title="Invalid Link"
        description="This verification link is invalid or expired"
        showBackToHome={true}
        className="max-w-lg"
      >
        <p className="text-center text-red-500">
          No verification token provided.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Email Verification"
      description="Complete your account setup"
      showBackToHome={false}
      className="max-w-lg"
    >
      <Suspense fallback={<VerifyEmailFormSkeleton />}>
        <VerifyEmailForm token={token} />
      </Suspense>
    </AuthLayout>
  );
}
