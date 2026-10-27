'use client';

import * as React from 'react';
import { Trophy, Medal, Star, TrendingUp, DollarSign } from 'lucide-react';
import { Card, Badge } from '@tecbunny/ui';

const LEADERBOARD_DATA = [
  { id: '1', name: 'Rahul Sharma', revenue: 1850000, target: 2000000, leads_closed: 24, rank: 1, avatar: 'RS' },
  { id: '2', name: 'Sneha Patel', revenue: 1520000, target: 2000000, leads_closed: 18, rank: 2, avatar: 'SP' },
  { id: '3', name: 'Ajay Singh', revenue: 1240000, target: 1500000, leads_closed: 15, rank: 3, avatar: 'AS' },
  { id: '4', name: 'Vikram Mehta', revenue: 850000, target: 1500000, leads_closed: 9, rank: 4, avatar: 'VM' },
];

export default function SalesLeaderboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8 p-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground tech-heading">Sales Leaderboard</h1>
          <p className="text-xs text-muted-foreground font-light mt-0.5 font-sans">
            Monthly performance and revenue gamification.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="px-3 py-1 bg-warning/10 text-warning border-warning/20">
            <Trophy className="w-3 h-3 mr-2" /> July 2026 Sprint
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Top 3 podium */}
        {LEADERBOARD_DATA.slice(0, 3).map((exec, idx) => (
          <Card key={exec.id} className={`p-6 relative overflow-hidden ${
            idx === 0 ? 'bg-gradient-to-b from-warning/10 to-warning/10 border-warning transform md:-translate-y-4' :
            idx === 1 ? 'bg-gradient-to-b from-muted to-muted border-border' :
            'bg-gradient-to-b from-accent/10 to-accent/10 border-accent transform md:translate-y-4'
          }`}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Trophy className="w-24 h-24" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-foreground shadow-lg mb-4 ${
                idx === 0 ? 'bg-warning text-warning-foreground' : idx === 1 ? 'bg-secondary' : 'bg-accent text-accent-foreground'
              }`}>
                {exec.avatar}
              </div>

              <div className="flex items-center gap-2 mb-1">
                {idx === 0 ? <Medal className="w-5 h-5 text-warning" /> :
                 idx === 1 ? <Medal className="w-5 h-5 text-muted-foreground" /> :
                 <Medal className="w-5 h-5 text-accent" />}
                <h2 className="text-lg font-bold text-foreground">{exec.name}</h2>
              </div>

              <div className="text-2xl font-black text-foreground my-2 font-mono">
                ₹{(exec.revenue / 100000).toFixed(1)}L
              </div>

              <div className="w-full mt-4 space-y-1">
                <div className={`flex justify-between text-[10px] uppercase font-semibold ${
                  idx === 0 ? 'text-warning/70' : idx === 1 ? 'text-muted-foreground/70' : 'text-accent/70'
                }`}>
                  <span>Target</span>
                  <span>{Math.round((exec.revenue / exec.target) * 100)}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${
                  idx === 0 ? 'bg-warning/20' : idx === 1 ? 'bg-muted' : 'bg-accent/20'
                }`}>
                  <div
                    className={`h-full rounded-full ${
                      idx === 0 ? 'bg-warning text-warning-foreground' : idx === 1 ? 'bg-secondary' : 'bg-accent text-accent-foreground'
                    }`}
                    style={{ width: `${Math.min(100, (exec.revenue / exec.target) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-card rounded-xl border shadow-sm mt-12">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" /> Full Rankings
          </h3>
        </div>
        <div className="divide-y">
          {LEADERBOARD_DATA.map(exec => (
            <div key={exec.id} className="p-4 flex items-center justify-between hover:bg-muted transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground text-xs">
                  #{exec.rank}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{exec.name}</h4>
                  <p className="text-xs text-muted-foreground">{exec.leads_closed} deals closed</p>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-bold text-primary">
                  ₹{(exec.revenue).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Target: ₹{(exec.target).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
