import { SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Scissors, LayoutDashboard, Home } from "lucide-react";

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export default function Header({ currentPath, navigate }: HeaderProps) {
  const { isSignedIn } = useUser();

  return (
    <header className="glass-card sticky top-0 z-50 w-full border-b border-slate-800/80 px-4 py-3 md:px-8">
      <div className="mx-auto flex max-auto max-w-7xl items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => navigate("/")}
          className="flex cursor-pointer items-center space-x-2 text-xl font-bold tracking-tight text-white hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-accent-violet shadow-lg shadow-brand-500/20">
            <Scissors className="h-5 w-5 text-white" />
          </div>
          <span className="gradient-text font-extrabold text-2xl">Scissor</span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-4 md:space-x-6">
          <button
            onClick={() => navigate("/")}
            className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
              currentPath === "/" 
                ? "text-brand-500" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </button>

          {isSignedIn && (
            <button
              onClick={() => navigate("/dashboard")}
              className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                currentPath === "/dashboard" 
                  ? "text-brand-500" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          )}

                    {/* Authentication Actions */}
          <div className="flex items-center pl-2 border-l border-slate-800">
            {isSignedIn ? (
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-9 w-9 border border-brand-500/30 hover:border-brand-500/80 transition-all duration-200"
                  }
                }}
              />
            ) : (
              <SignInButton mode="modal">
                <button className="flex items-center justify-center rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-brand-500/10 hover:from-brand-700 hover:to-brand-600 hover:shadow-brand-500/20 active:scale-95 transition-all">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}