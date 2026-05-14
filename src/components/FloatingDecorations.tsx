import React from "react";
import { Dumbbell, Trophy, Target, Activity, Flame, Medal } from "lucide-react";

export default function FloatingDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 hidden lg:block opacity-40 dark:opacity-20">
      {/* Left Side */}
      <div className="absolute top-[20%] left-[5%] -rotate-12 animate-[bounce_6s_ease-in-out_infinite]">
        <Dumbbell className="w-12 h-12 text-indigo-500/80" />
      </div>
      <div className="absolute top-[50%] left-[8%] rotate-12 animate-[bounce_7s_ease-in-out_infinite] [animation-delay:1s]">
        <Trophy className="w-16 h-16 text-amber-500/80" />
      </div>
      <div className="absolute bottom-[20%] left-[4%] -rotate-6 animate-[bounce_8s_ease-in-out_infinite] [animation-delay:2s]">
        <Activity className="w-10 h-10 text-emerald-500/80" />
      </div>
      
      {/* Right Side */}
      <div className="absolute top-[30%] right-[6%] rotate-12 animate-[bounce_6s_ease-in-out_infinite] [animation-delay:1.5s]">
        <Target className="w-14 h-14 text-fuchsia-500/80" />
      </div>
      <div className="absolute top-[60%] right-[4%] -rotate-12 animate-[bounce_7s_ease-in-out_infinite] [animation-delay:2.5s]">
        <Flame className="w-12 h-12 text-rose-500/80" />
      </div>
      <div className="absolute bottom-[15%] right-[8%] rotate-6 animate-[bounce_8s_ease-in-out_infinite] [animation-delay:0.5s]">
        <Medal className="w-16 h-16 text-amber-400/80" />
      </div>
    </div>
  );
}
