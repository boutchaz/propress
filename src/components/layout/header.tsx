import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";
// import { MobileSidebar } from "@/components/layout/mobile-sidebar";
// import { Boxes } from "lucide-react";
// import { UserNav } from "@/components/layout/user-nav";
import IconGroupeProPress from "@/assets/icon-logo.png";
import { Link } from "@tanstack/react-router";

export default function Header() {
  // const { data: sessionData } = useSession();
  return (
    <div className="supports-backdrop-blur:bg-background/60 fixed left-0 right-0 top-0 z-20 border-b bg-background/95 backdrop-blur">
      <nav className="flex h-16 items-center justify-between px-4">
        <Link
          href={"/"}
          className="hidden items-center justify-between gap-2 md:flex"
        >
          {/* <Boxes className="h-6 w-6" /> */}
          <img
            src={IconGroupeProPress}
            className="h-8 me-3"
            alt="Groupe ProPres Logo"
          />
          <h1 className="text-lg font-semibold">Le Kiosque Numérique</h1>
        </Link>
        {/* <Boxes className="h-6 w-6" /> */}
        <div className={cn("block md:!hidden")}>{/* <MobileSidebar /> */}</div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* {sessionData?.user ? (
            <UserNav user={sessionData.user} />
          ) : (
            <Button
              size="sm"
              onClick={() => {
                // void signIn();
              }}
            >
              Sign In
            </Button>
          )} */}
        </div>
      </nav>
    </div>
  );
}
