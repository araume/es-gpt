"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/chat");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        <span className="text-lg font-mono">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-black">
      <div className="w-full max-w-sm p-8 border border-black rounded-lg shadow-lg flex flex-col items-center gap-8">
        <h1 className="text-2xl font-bold font-mono mb-2">es-gpt</h1>
        {session ? (
          <>
            <div className="flex flex-col items-center gap-2">
              {session.user?.image && (
                <img src={session.user.image} alt="avatar" className="w-16 h-16 rounded-full border border-black" />
              )}
              <span className="font-mono text-lg">{session.user?.name || session.user?.email}</span>
            </div>
            <button
              className="w-full py-2 border border-black rounded bg-black text-white font-mono hover:bg-white hover:text-black transition"
              onClick={() => signOut()}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <button
              className="w-full py-2 border border-black rounded bg-black text-white font-mono hover:bg-white hover:text-black transition"
              onClick={() => signIn("google")}
            >
              Sign in with Google
            </button>
            <button
              className="w-full py-2 border border-black rounded font-mono hover:bg-black hover:text-white transition"
              onClick={() => signIn("email")}
            >
              Sign in with Email
            </button>
          </>
        )}
      </div>
    </div>
  );
}
