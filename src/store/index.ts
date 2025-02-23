import { create } from 'zustand'

interface MainLayoutState {
  mainSidebarOpen: boolean
  setMainSidebarOpen: (open: boolean) => void
}

interface AppState {
  count: number
  increment: () => void
  decrement: () => void
}

export const useMainLayoutState = create<MainLayoutState>((set) => ({
  mainSidebarOpen: false,
  setMainSidebarOpen: (open) => set({ mainSidebarOpen: open }),
}))

export const useAppState = create<AppState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}))
