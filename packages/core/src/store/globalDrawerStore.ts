import { create } from 'zustand';
import React from 'react';

type GlobalDrawerState = {
  isOpen: boolean;
  title: string | React.ReactNode;
  content: React.ReactNode | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  openDrawer: (title: string | React.ReactNode, content: React.ReactNode, size?: 'sm' | 'md' | 'lg' | 'xl' | 'full') => void;
  closeDrawer: () => void;
};

export const useGlobalDrawer = create<GlobalDrawerState>((set) => ({
  isOpen: false,
  title: '',
  content: null,
  size: 'md',
  
  openDrawer: (title, content, size = 'md') => set({ isOpen: true, title, content, size }),
  closeDrawer: () => set({ isOpen: false }),
}));
