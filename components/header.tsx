"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, Flame, Search, Leaf, User, Calendar, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface HeaderProps {
  currentStreak: number;
}

export function Header({ currentStreak }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/calendar", label: "Calendar" },
    { href: "/explore", label: "Explore" },
    { href: "/tutorials", label: "Tutorials" },
  ];

  const initials = user?.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "";

  const handleSignOut = () => {
    signOut();
    router.push("/");
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-6xl mx-auto flex h-16 items-center px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-hobby-yellow">
            <Leaf className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground">MicroHobby</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center justify-center gap-6 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Streak Badge */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-hobby-yellow/20 px-3 py-1.5">
            <Flame className="h-4 w-4 text-hobby-coral" />
            <span className="text-sm font-bold text-foreground">{currentStreak}</span>
            <span className="text-xs text-muted-foreground">day streak</span>
          </div>

          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search hobbies</span>
          </Button>

          <Link href="/calendar" className="hidden md:flex">
            <Button variant="ghost" size="icon">
              <Calendar className="h-5 w-5" />
              <span className="sr-only">View calendar</span>
            </Button>
          </Link>

          {/* Desktop: user avatar dropdown or sign in */}
          <div className="hidden md:flex">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full p-0 h-9 w-9">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photo ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" /> Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Navigate through MicroHobby sections.</SheetDescription>

              <div className="flex flex-col gap-6 pt-6">
                {/* Mobile user info or auth buttons */}
                {user ? (
                  <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photo ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">Sign in</Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">Sign up</Button>
                    </Link>
                  </div>
                )}

                {/* Mobile Streak */}
                <div className="flex items-center gap-2 rounded-xl bg-hobby-yellow/20 p-3">
                  <Flame className="h-5 w-5 text-hobby-coral" />
                  <div>
                    <span className="text-lg font-bold">{currentStreak}</span>
                    <span className="text-sm text-muted-foreground ml-1">day streak</span>
                  </div>
                </div>

                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {user && (
                    <Link
                      href="/account"
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      Account
                    </Link>
                  )}
                  {user && (
                    <button
                      onClick={handleSignOut}
                      className="text-lg font-medium text-red-600 hover:text-red-500 transition-colors text-left"
                    >
                      Sign out
                    </button>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
