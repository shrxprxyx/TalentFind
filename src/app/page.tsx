"use client";

import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn } = useUser();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-5">
      <h1 className="text-5xl font-bold">
        TalentStage
      </h1>

      {!isSignedIn ? (
        <div className="flex gap-4">
          <SignInButton />
          <SignUpButton />
        </div>
      ) : (
        <UserButton />
      )}
    </main>
  );
}