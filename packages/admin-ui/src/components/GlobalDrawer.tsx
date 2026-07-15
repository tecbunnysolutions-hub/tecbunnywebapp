'use client';

import React from 'react';
import { useGlobalDrawer } from '@tecbunny/core';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@tecbunny/ui';

export function GlobalDrawer() {
  const { isOpen, title, content, size, closeDrawer } = useGlobalDrawer();

  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg lg:max-w-xl',
    xl: 'sm:max-w-xl lg:max-w-3xl',
    full: 'w-screen sm:max-w-[100vw]'
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent className={`overflow-y-auto w-full ${sizeClasses[(size || 'md') as keyof typeof sizeClasses]} bg-slate-50 border-l-0 shadow-2xl`}>
        <SheetHeader className="mb-6 sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 pb-4 border-b">
          <SheetTitle className="text-xl font-bold text-slate-900">{title}</SheetTitle>
        </SheetHeader>
        <div className="pb-8">
          {content}
        </div>
      </SheetContent>
    </Sheet>
  );
}
