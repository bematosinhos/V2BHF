import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authService from '../lib/auth'
import * as professionalService from '../lib/professionals'
import * as timeRecordService from '../lib/time-records'

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
  isLoading: boolean

  // Professionals
  professionals: Professional[]
  selectedProfessionalId: string | null
  fetchProfessionals: () => Promise<Professional[]>
  addProfessional: (professional: Omit<Professional, 'id'>) => Promise<Professional | null>
  updateProfessional: (id: string, data: Partial<Professional>) => Promise<Professional | null>
  removeProfessional: (id: string) => Promise<void>
  selectProfessional: (id: string | null) => void

  // Time Records
  timeRecords: TimeRecord[]
  fetchTimeRecords: (professionalId?: string) => Promise<void>
  addTimeRecord: (record: Omit<TimeRecord, 'id'>) => Promise<void>
  updateTimeRecord: (id: string, data: Partial<TimeRecord>) => Promise<void>
  removeTimeRecord: (id: string) => Promise<void>
  getTimeRecordsForProfessional: (professionalId: string) => TimeRecord[]
  getTimeRecordsForDate: (date: string) => Promise<void>
}

// Exportamos os dados mock para uso na migração, se necessário
export const mockProfessionals: Professional[] = [
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

export const mockTimeRecords: TimeRecord[] = [
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
  // ... outros registros (mantidos para referência)
]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      isAuthenticated: false,
      user: null,
      isLoading: false,
      login: async (email, password) => {
        const { data, error } = await authService.signIn(email, password)
        if (error) return false
        
        if (data?.user) {
          set({
            isAuthenticated: true,
            user: {
              id: data.user.id,
              email: data.user.email ?? '',
              name: data.user.user_metadata?.name || 'Usuário',
            },
          })
          return true
        }
        return false
      },
      logout: async () => {
        await authService.signOut()
        set({
          isAuthenticated: false,
          user: null,
        })
      },

      // Professionals
      professionals: [],
      selectedProfessionalId: null,
      fetchProfessionals: async () => {
        try {
          set({ isLoading: true });
          const { data, error } = await professionalService.getAllProfessionals();
          if (error) throw error;
          
          if (data) {
            // Converter os nomes das colunas de snake_case para camelCase
            const formattedData = data.map(p => ({
              id: p.id,
              name: p.name,
              role: p.role,
              status: p.status,
              startDate: p.start_date,
              avatarUrl: p.avatar_url,
              cpf: p.cpf,
              birthDate: p.birth_date,
              workHours: p.work_hours,
              workCity: p.work_city,
              salary: p.salary,
              address: p.address,
              phone: p.phone,
              email: p.email
            })) as Professional[];
            
            set({ professionals: formattedData });
            
            // Se não houver profissional selecionado e houver profissionais, selecione o primeiro
            const { selectedProfessionalId } = get();
            if (!selectedProfessionalId && formattedData.length > 0) {
              set({ selectedProfessionalId: formattedData[0].id });
            }
            
            return formattedData;
          }
          return [];
        } catch (error) {
          console.error('Erro ao buscar profissionais:', error);
          return [];
        } finally {
          set({ isLoading: false });
        }
      },
      addProfessional: async (professional) => {
        try {
          set({ isLoading: true });
          
          // Converter camelCase para snake_case para o Supabase
          const professionalData = {
            name: professional.name,
            role: professional.role,
            status: professional.status,
            start_date: professional.startDate,
            avatar_url: professional.avatarUrl,
            cpf: professional.cpf,
            birth_date: professional.birthDate,
            work_hours: professional.workHours,
            work_city: professional.workCity,
            salary: professional.salary,
            address: professional.address,
            phone: professional.phone,
            email: professional.email
          };
          
          const { data, error } = await professionalService.addProfessional(professionalData);
          if (error) throw error;
          
          if (data && data[0]) {
            // Converter de volta para camelCase
            const newProfessional: Professional = {
              id: data[0].id,
              name: data[0].name,
              role: data[0].role,
              status: data[0].status,
              startDate: data[0].start_date,
              avatarUrl: data[0].avatar_url,
              cpf: data[0].cpf,
              birthDate: data[0].birth_date,
              workHours: data[0].work_hours,
              workCity: data[0].work_city,
              salary: data[0].salary,
              address: data[0].address,
              phone: data[0].phone,
              email: data[0].email
            };
            
            set((state) => ({
              professionals: [...state.professionals, newProfessional],
            }));
            
            return newProfessional;
          }
          return null;
        } catch (error) {
          console.error('Erro ao adicionar profissional:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      updateProfessional: async (id, updates) => {
        try {
          set({ isLoading: true });
          
          // Converter camelCase para snake_case para o Supabase
          const updateData: any = {};
          if (updates.name !== undefined) updateData.name = updates.name;
          if (updates.role !== undefined) updateData.role = updates.role;
          if (updates.status !== undefined) updateData.status = updates.status;
          if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
          if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
          if (updates.cpf !== undefined) updateData.cpf = updates.cpf;
          if (updates.birthDate !== undefined) updateData.birth_date = updates.birthDate;
          if (updates.workHours !== undefined) updateData.work_hours = updates.workHours;
          if (updates.workCity !== undefined) updateData.work_city = updates.workCity;
          if (updates.salary !== undefined) updateData.salary = updates.salary;
          if (updates.address !== undefined) updateData.address = updates.address;
          if (updates.phone !== undefined) updateData.phone = updates.phone;
          if (updates.email !== undefined) updateData.email = updates.email;
          
          const { data, error } = await professionalService.updateProfessional(id, updateData);
          if (error) throw error;
          
          if (data && data[0]) {
            // Atualizar o estado local com os dados retornados
            const updatedProfessional: Professional = {
              id: data[0].id,
              name: data[0].name,
              role: data[0].role,
              status: data[0].status,
              startDate: data[0].start_date,
              avatarUrl: data[0].avatar_url,
              cpf: data[0].cpf,
              birthDate: data[0].birth_date,
              workHours: data[0].work_hours,
              workCity: data[0].work_city,
              salary: data[0].salary,
              address: data[0].address,
              phone: data[0].phone,
              email: data[0].email
            };
            
            set((state) => ({
              professionals: state.professionals.map((p) => p.id === id ? updatedProfessional : p),
            }));
            
            return updatedProfessional;
          }
          return null;
        } catch (error) {
          console.error('Erro ao atualizar profissional:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      removeProfessional: async (id) => {
        try {
          set({ isLoading: true });
          const { error } = await professionalService.removeProfessional(id);
          if (error) throw error;
          
          set((state) => ({
            professionals: state.professionals.filter((p) => p.id !== id),
          }));
        } catch (error) {
          console.error('Erro ao remover profissional:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      selectProfessional: (id) => {
        set({ selectedProfessionalId: id })
        if (id) {
          get().fetchTimeRecords(id)
        }
      },

      // Time Records
      timeRecords: [],
      fetchTimeRecords: async (professionalId) => {
        const id = professionalId ?? get().selectedProfessionalId
        if (!id) return
        
        const { data, error } = await timeRecordService.getTimeRecordsForProfessional(id)
        if (error) {
          console.error('Erro ao buscar registros de tempo:', error)
          return
        }
        
        if (data) {
          // Converter os nomes das colunas de snake_case para camelCase
          const formattedData = data.map(r => ({
            id: r.id,
            professionalId: r.professional_id,
            date: r.date,
            checkIn: r.check_in,
            checkOut: r.check_out,
            breakStart: r.break_start,
            breakEnd: r.break_end,
            type: r.type,
            notes: r.notes
          })) as TimeRecord[]
          
          set({ timeRecords: formattedData })
        }
      },
      addTimeRecord: async (record) => {
        // Converter camelCase para snake_case para o Supabase
        const recordData = {
          professional_id: record.professionalId,
          date: record.date,
          check_in: record.checkIn,
          check_out: record.checkOut,
          break_start: record.breakStart,
          break_end: record.breakEnd,
          type: record.type,
          notes: record.notes
        }
        
        const { data, error } = await timeRecordService.addTimeRecord(recordData)
        if (error) {
          console.error('Erro ao adicionar registro de tempo:', error)
          return
        }
        
        if (data && data[0]) {
          // Converter de volta para camelCase
          const newRecord: TimeRecord = {
            id: data[0].id,
            professionalId: data[0].professional_id,
            date: data[0].date,
            checkIn: data[0].check_in,
            checkOut: data[0].check_out,
            breakStart: data[0].break_start,
            breakEnd: data[0].break_end,
            type: data[0].type,
            notes: data[0].notes
          }
          
          set((state) => ({
            timeRecords: [...state.timeRecords, newRecord],
          }))
        }
      },
      updateTimeRecord: async (id, updates) => {
        // Converter camelCase para snake_case para o Supabase
        const updateData: any = {}
        if (updates.professionalId !== undefined) updateData.professional_id = updates.professionalId
        if (updates.date !== undefined) updateData.date = updates.date
        if (updates.checkIn !== undefined) updateData.check_in = updates.checkIn
        if (updates.checkOut !== undefined) updateData.check_out = updates.checkOut
        if (updates.breakStart !== undefined) updateData.break_start = updates.breakStart
        if (updates.breakEnd !== undefined) updateData.break_end = updates.breakEnd
        if (updates.type !== undefined) updateData.type = updates.type
        if (updates.notes !== undefined) updateData.notes = updates.notes
        
        const { data, error } = await timeRecordService.updateTimeRecord(id, updateData)
        if (error) {
          console.error('Erro ao atualizar registro de tempo:', error)
          return
        }
        
        if (data && data[0]) {
          // Atualizar o estado local com os dados retornados
          set((state) => ({
            timeRecords: state.timeRecords.map((r) => 
              r.id === id ? {
                id: data[0].id,
                professionalId: data[0].professional_id,
                date: data[0].date,
                checkIn: data[0].check_in,
                checkOut: data[0].check_out,
                breakStart: data[0].break_start,
                breakEnd: data[0].break_end,
                type: data[0].type,
                notes: data[0].notes
              } : r
            ),
          }))
        }
      },
      removeTimeRecord: async (id) => {
        const { error } = await timeRecordService.removeTimeRecord(id)
        if (error) {
          console.error('Erro ao remover registro de tempo:', error)
          return
        }
        
        set((state) => ({
          timeRecords: state.timeRecords.filter((r) => r.id !== id),
        }))
      },
      getTimeRecordsForProfessional: (professionalId) => {
        return get().timeRecords.filter((r) => r.professionalId === professionalId)
      },
      getTimeRecordsForDate: async (date) => {
        const { data, error } = await timeRecordService.getTimeRecordsForDate(date)
        if (error) {
          console.error('Erro ao buscar registros para a data:', error)
          return
        }
        
        if (data) {
          // Converter os nomes das colunas de snake_case para camelCase
          const formattedData = data.map(r => ({
            id: r.id,
            professionalId: r.professional_id,
            date: r.date,
            checkIn: r.check_in,
            checkOut: r.check_out,
            breakStart: r.break_start,
            breakEnd: r.break_end,
            type: r.type,
            notes: r.notes
          })) as TimeRecord[]
          
          set({ timeRecords: formattedData })
        }
      },
    }),
    {
      name: 'ponto-domestico-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    },
  ),
)
