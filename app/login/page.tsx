"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { DailyChallenge } from "@/components/daily-challenge";
import { StreakCard } from "@/components/streak-card";
import { CategoryGrid } from "@/components/category-grid";
import { HobbyCard } from "@/components/hobby-card";
import { TutorialModal } from "@/components/tutorial-modal";
import { WeeklyCalendar } from "@/components/weekly-calendar";
import { IdeasSection } from "@/components/ideas-section";
import { Button } from "@/components/ui/button";
import { hobbies, getRandomHobby, getHobbiesByCategory, getHobbyById, type Hobby } from "@/lib/hobbies";
import { useUser } from "@/lib/user-context";
import { Sparkles, Heart, TrendingUp, Leaf, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { progress, handleComplete: contextHandleComplete, handleFavorite, completedEntries, today } = useUser();
  const [dailyHobby, setDailyHobby] = useState<Hobby | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedHobby, setSelectedHobby] = useState<Hobby | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCompletionToast, setShowCompletionToast] = useState(false);

  // Initialize daily hobby
  useEffect(() => {
    setDailyHobby(getRandomHobby(progress.hobbiesCompleted));
  }, [progress.hobbiesCompleted]);

  const handleComplete = useCallback((id: string) => {
    contextHandleComplete(id);
    setShowCompletionToast(true);
    setTimeout(() => setShowCompletionToast(false), 3000);
  }, [contextHandleComplete]);

  const handleSkipDaily = useCallback(() => {
    setDailyHobby(getRandomHobby([...progress.hobbiesCompleted, dailyHobby?.id || ""]));
  }, [progress.hobbiesCompleted, dailyHobby?.id]);

  // Calculate weekly completions based on actual data
  const getWeeklyCompletions = useCallback(() => {
    const completions: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split("T")[0];
      completions.push(completedEntries.some(e => e.date === dateStr));
    }
    return completions;
  }, [completedEntries, today]);

  const weeklyCompletions = getWeeklyCompletions();

  const handleSelectHobby = useCallback((id: string) => {
    const hobby = getHobbyById(id);
    if (hobby) {
      setSelectedHobby(hobby);
      setIsModalOpen(true);
    }
  }, []);

  const displayedHobbies = selectedCategory
    ? getHobbiesByCategory(selectedCategory)
    : hobbies;

  

  return (
    <div className="min-h-screen bg-background">
      <Header currentStreak={progress.currentStreak} />

      {/* Completion Toast */}
      {showCompletionToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-3 bg-hobby-green text-white px-5 py-3 rounded-full shadow-lg">
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">Hobby completed! Streak: {progress.currentStreak}</span>
          </div>
        </div>
      )}

      <main className="container max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-10">
        {/* Hero Section */}
        <section className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Try something new in 20 minutes
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Discover tiny, low-commitment hobbies. Make thoughtful gifts, plan fun activities, 
            or just get off your phone and touch some grass.
          </p>
        </section>

        {/* Stats Overview */}
        <section>
          <StreakCard
            currentStreak={progress.currentStreak}
            longestStreak={progress.longestStreak}
            totalMinutes={progress.totalMinutes}
            hobbiesCompleted={progress.hobbiesCompleted.length}
          />
        </section>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Daily Challenge */}
          <div className="lg:col-span-2">
            {dailyHobby && (
              <DailyChallenge
                hobby={dailyHobby}
                onComplete={handleComplete}
                onSkip={handleSkipDaily}
                onFavorite={handleFavorite}
                isFavorite={progress.favorites.includes(dailyHobby.id)}
              />
            )}
          </div>

          {/* Weekly Calendar - Takes 3 cols on large screens */}
          <div className="lg:col-span-3">
            <WeeklyCalendar
              completedDays={weeklyCompletions}
              currentStreak={progress.currentStreak}
            />
          </div>
        </div>

        {/* Ideas Section */}
        <section id="tutorials">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Find Your Inspiration</h2>
          </div>
          <IdeasSection />
        </section>

        {/* Explore Categories */}
        <section id="explore">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Explore Categories</h2>
          </div>
          <CategoryGrid
            onSelectCategory={setSelectedCategory}
            selectedCategory={selectedCategory}
          />
        </section>

        {/* Hobby Grid */}
        <section id="progress">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {selectedCategory
                ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Activities`
                : "All Activities"}
            </h2>
            {selectedCategory && (
              <Button variant="ghost" onClick={() => setSelectedCategory(null)}>
                View All
              </Button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedHobbies.map((hobby) => (
              <HobbyCard
                key={hobby.id}
                hobby={hobby}
                isCompleted={progress.hobbiesCompleted.includes(hobby.id)}
                isFavorite={progress.favorites.includes(hobby.id)}
                onSelect={handleSelectHobby}
                onFavorite={handleFavorite}
              />
            ))}
          </div>
        </section>

        {/* Favorites Section */}
        {progress.favorites.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-hobby-coral" />
                <h2 className="text-2xl font-bold text-foreground">Your Favorites</h2>
              </div>
              <Link href="/favorites">
                <Button variant="ghost" className="gap-2">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {progress.favorites.slice(0, 4).map((id) => {
                const hobby = getHobbyById(id);
                if (!hobby) return null;
                return (
                  <HobbyCard
                    key={hobby.id}
                    hobby={hobby}
                    isCompleted={progress.hobbiesCompleted.includes(hobby.id)}
                    isFavorite={true}
                    onSelect={handleSelectHobby}
                    onFavorite={handleFavorite}
                  />
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container max-w-6xl mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hobby-yellow">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-foreground">MicroHobby</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Make something beautiful. Gift something thoughtful. Touch some grass.
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} MicroHobby
            </p>
          </div>
        </div>
      </footer>

      {/* Tutorial Modal */}
      <TutorialModal
        hobby={selectedHobby}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedHobby(null);
        }}
        onComplete={handleComplete}
        onFavorite={handleFavorite}
        isFavorite={selectedHobby ? progress.favorites.includes(selectedHobby.id) : false}
      />
    </div>
  );
}
