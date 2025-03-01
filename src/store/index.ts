import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Professional {
  id: string
  name: string
  role: string
  status: 'active' | 'inactive' | 'vacation'
  startDate: string
  avatarUrl?: string
  cpf: string
  birthDate: string
  workHours: string
  workCity: string
  salary: string
  address: string
  phone: string
  email?: string
}

export interface TimeRecord {
  id: string
  professionalId: string
  date: string
  checkIn?: string
  checkOut?: string
  breakStart?: string
  breakEnd?: string
  type: 'regular' | 'overtime' | 'dayoff' | 'vacation'
  notes?: string
}

export interface User {
  id: string
  email: string
  name: string
}

interface AppState {
  // Auth
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void

  // Professionals
  professionals: Professional[]
  selectedProfessionalId: string | null
  addProfessional: (professional: Omit<Professional, 'id'>) => void
  updateProfessional: (id: string, data: Partial<Professional>) => void
  removeProfessional: (id: string) => void
  selectProfessional: (id: string | null) => void

  // Time Records
  timeRecords: TimeRecord[]
  addTimeRecord: (record: Omit<TimeRecord, 'id'>) => void
  updateTimeRecord: (id: string, data: Partial<TimeRecord>) => void
  removeTimeRecord: (id: string) => void
  getTimeRecordsForProfessional: (professionalId: string) => TimeRecord[]
  getTimeRecordsForDate: (date: string) => TimeRecord[]
}

// Mock data
const mockProfessionals: Professional[] = [
  {
    id: '1',
    name: 'Maria Silva',
    role: 'Babá',
    status: 'active',
    startDate: '2022-01-15',
    cpf: '123.456.789-00',
    birthDate: '1985-05-10',
    workHours: '44',
    workCity: 'São Paulo',
    salary: '2500',
    address: 'Rua das Flores, 123',
    phone: '(11) 98765-4321',
    email: 'maria@exemplo.com',
    avatarUrl: '',
  },
  {
    id: '2',
    name: 'João Santos',
    role: 'Jardineiro',
    status: 'active',
    startDate: '2021-05-03',
    cpf: '987.654.321-00',
    birthDate: '1978-08-15',
    workHours: '30',
    workCity: 'São Paulo',
    salary: '1800',
    address: 'Av. Principal, 456',
    phone: '(11) 91234-5678',
    avatarUrl: '',
  },
  {
    id: '3',
    name: 'Ana Oliveira',
    role: 'Empregada Doméstica',
    status: 'vacation',
    startDate: '2020-11-10',
    cpf: '456.789.123-00',
    birthDate: '1982-03-22',
    workHours: '44',
    workCity: 'São Paulo',
    salary: '2200',
    address: 'Rua dos Pinheiros, 789',
    phone: '(11) 99876-5432',
    email: 'ana@exemplo.com',
    avatarUrl: '',
  },
]

const mockTimeRecords: TimeRecord[] = [
  {
    id: '1',
    professionalId: '1',
    date: '2023-11-01',
    checkIn: '08:00',
    checkOut: '17:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    type: 'regular',
  },
  {
    id: '2',
    professionalId: '2',
    date: '2023-11-01',
    checkIn: '07:00',
    checkOut: '16:00',
    breakStart: '11:00',
    breakEnd: '12:00',
    type: 'regular',
  },
  {
    id: '3',
    professionalId: '3',
    date: '2023-11-01',
    type: 'vacation',
    notes: 'Férias programadas',
  },
  {
    id: '4',
    professionalId: '1',
    date: '2024-05-02',
    checkIn: '07:45',
    checkOut: '17:15',
    breakStart: '12:00',
    breakEnd: '13:00',
    type: 'regular',
  },
  {
    id: '5',
    professionalId: '1',
    date: '2024-05-03',
    checkIn: '08:10',
    checkOut: '17:30',
    breakStart: '12:00',
    breakEnd: '13:00',
    type: 'regular',
  },
  {
    id: '6',
    professionalId: '1',
    date: '2024-05-06',
    checkIn: '08:00',
    checkOut: '17:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    type: 'regular',
  },
  {
    id: '7',
    professionalId: '1',
    date: '2024-05-07',
    checkIn: '08:30',
    checkOut: '16:45',
    breakStart: '12:00',
    breakEnd: '13:00',
    type: 'regular',
  },
  {
    id: '8',
    professionalId: '1',
    date: '2024-05-08',
    notes: 'Falta não justificada',
    type: 'regular',
  },
  {
    id: '9',
    professionalId: '1',
    date: '2024-05-09',
    checkIn: '08:05',
    checkOut: '18:15',
    breakStart: '12:00',
    breakEnd: '13:00',
    type: 'regular',
  },
  {
    id: '10',
    professionalId: '1',
    date: '2024-05-10',
    checkIn: '07:50',
    checkOut: '17:10',
    breakStart: '12:00',
    breakEnd: '13:00',
    type: 'regular',
  },
  {
    id: '11',
    professionalId: '1',
    date: '2024-05-13',
    type: 'dayoff',
    notes: 'Folga concedida',
  },
  {
    id: '12',
    professionalId: '1',
    date: '2024-05-14',
    checkIn: '08:00',
    checkOut: '17:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    type: 'regular',
  },
  {
    id: '13',
    professionalId: '1',
    date: '2024-05-15',
    notes: 'Atestado médico',
    type: 'regular',
  },
  {
    id: '14',
    professionalId: '1',
    date: '2024-05-16',
    checkIn: '08:00',
    checkOut: '17:30',
    breakStart: '12:00',
    breakEnd: '13:00',
    type: 'regular',
  },
  {
    id: '15',
    professionalId: '1',
    date: '2024-05-17',
    checkIn: '07:55',
    checkOut: '17:05',
    breakStart: '12:00',
    breakEnd: '13:00',
    type: 'regular',
  },
]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      isAuthenticated: false,
      user: null,
      login: async (email, password) => {
        // Simulação de login
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simular delay de rede

        if (email === 'admin@exemplo.com' && password === '123456') {
          set({
            isAuthenticated: true,
            user: {
              id: '1',
              email,
              name: 'Administrador',
            },
          })
          return true
        }
        return false
      },
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
        })
      },

      // Professionals
      professionals: mockProfessionals,
      selectedProfessionalId: mockProfessionals[0]?.id ?? null,
      addProfessional: (professional) => {
        const newProfessional = {
          ...professional,
          id: Date.now().toString(),
        }
        set((state) => ({
          professionals: [...state.professionals, newProfessional],
        }))
      },
      updateProfessional: (id, data) => {
        set((state) => ({
          professionals: state.professionals.map((p) => (p.id === id ? { ...p, ...data } : p)),
        }))
      },
      removeProfessional: (id) => {
        set((state) => ({
          professionals: state.professionals.filter((p) => p.id !== id),
        }))
      },
      selectProfessional: (id) => {
        set({ selectedProfessionalId: id })
      },

      // Time Records
      timeRecords: mockTimeRecords,
      addTimeRecord: (record) => {
        const newRecord = {
          ...record,
          id: Date.now().toString(),
        }
        set((state) => ({
          timeRecords: [...state.timeRecords, newRecord],
        }))
      },
      updateTimeRecord: (id, data) => {
        set((state) => ({
          timeRecords: state.timeRecords.map((r) => (r.id === id ? { ...r, ...data } : r)),
        }))
      },
      removeTimeRecord: (id) => {
        set((state) => ({
          timeRecords: state.timeRecords.filter((r) => r.id !== id),
        }))
      },
      getTimeRecordsForProfessional: (professionalId) => {
        return get().timeRecords.filter((r) => r.professionalId === professionalId)
      },
      getTimeRecordsForDate: (date) => {
        return get().timeRecords.filter((r) => r.date === date)
      },
    }),
    {
      name: 'ponto-domestico-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        professionals: state.professionals,
        selectedProfessionalId: state.selectedProfessionalId,
        timeRecords: state.timeRecords,
      }),
    },
  ),
)
