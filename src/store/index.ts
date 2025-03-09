import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authService from '../lib/auth'
import * as professionalService from '../lib/professionals'
import * as timeRecordService from '../lib/time-records'

// Tipos para representar os dados do Supabase (snake_case)
export interface SupabaseProfessional {
  id: string
  name: string
  role: string
  status: 'active' | 'inactive' | 'vacation'
  start_date: string
  avatar_url?: string
  cpf: string
  birth_date: string
  work_hours: string
  work_city: string
  salary: string
  address: string
  phone: string
  email: string
  created_at?: string
  updated_at?: string
}

export interface SupabaseTimeRecord {
  id: string
  professional_id: string
  date: string
  start_time: string
  end_time: string
  check_in?: string
  check_out?: string
  break_start?: string
  break_end?: string
  type: 'regular' | 'overtime' | 'dayoff' | 'vacation'
  notes?: string
  description?: string
  created_at?: string
  updated_at?: string
}

// Tipos para a aplicação (camelCase)
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
  setAuthenticated: (value: boolean) => void

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

// Funções de conversão entre snake_case e camelCase
const convertToSupabaseProfessional = (
  professional: Omit<Professional, 'id'>,
): Omit<SupabaseProfessional, 'id' | 'created_at' | 'updated_at'> => {
  return {
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
    email: professional.email ?? '',
  }
}

const convertToAppProfessional = (professional: SupabaseProfessional): Professional => {
  return {
    id: professional.id,
    name: professional.name,
    role: professional.role,
    status: professional.status,
    startDate: professional.start_date,
    avatarUrl: professional.avatar_url,
    cpf: professional.cpf,
    birthDate: professional.birth_date,
    workHours: professional.work_hours,
    workCity: professional.work_city,
    salary: professional.salary,
    address: professional.address,
    phone: professional.phone,
    email: professional.email,
  }
}

const convertToSupabaseTimeRecord = (
  record: Omit<TimeRecord, 'id'>,
): Omit<SupabaseTimeRecord, 'id' | 'created_at' | 'updated_at'> => {
  return {
    professional_id: record.professionalId,
    date: record.date,
    start_time: record.type === 'regular' ? '08:00' : '00:00', // Valores padrão para satisfy TypeScript
    end_time: record.type === 'regular' ? '17:00' : '00:00', // Valores padrão para satisfy TypeScript
    check_in: record.checkIn,
    check_out: record.checkOut,
    break_start: record.breakStart,
    break_end: record.breakEnd,
    type: record.type,
    notes: record.notes,
  }
}

const convertToAppTimeRecord = (record: SupabaseTimeRecord): TimeRecord => {
  return {
    id: record.id,
    professionalId: record.professional_id,
    date: record.date,
    checkIn: record.check_in,
    checkOut: record.check_out,
    breakStart: record.break_start,
    breakEnd: record.break_end,
    type: record.type,
    notes: record.notes,
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      isAuthenticated: false,
      user: null,
      isLoading: false,
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      login: async (email, password) => {
        const { data, error } = await authService.signIn(email, password)
        if (error) return false

        if (data?.user) {
          set({
            isAuthenticated: true,
            user: {
              id: data.user.id,
              email: data.user.email ?? '',
              name: (data.user.user_metadata?.name as string) ?? 'Usuário',
            } as User,
          })
          return true
        }
        return false
      },
      logout: () => {
        void authService.signOut()
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
          set({ isLoading: true })
          const { data, error } = await professionalService.getAllProfessionals()
          if (error) throw error

          if (data) {
            // Converter os nomes das colunas de snake_case para camelCase
            const formattedData = data.map((p) =>
              convertToAppProfessional(p as SupabaseProfessional),
            )

            set({ professionals: formattedData })

            // Se não houver profissional selecionado e houver profissionais, selecione o primeiro
            const { selectedProfessionalId } = get()
            if (!selectedProfessionalId && formattedData.length > 0) {
              set({ selectedProfessionalId: formattedData[0].id })
            }

            return formattedData
          }
          return []
        } catch (error) {
          console.error('Erro ao buscar profissionais:', error)
          return []
        } finally {
          set({ isLoading: false })
        }
      },
      addProfessional: async (professional) => {
        try {
          set({ isLoading: true })
          console.log('Iniciando processo de adição de profissional no store', { 
            name: professional.name, 
            cpf: professional.cpf?.substring(0, 5) + '***' // Log seguro
          });

          // Garantir que todos os campos obrigatórios estejam presentes
          const professionalWithRequiredFields = {
            ...professional,
            email: professional.email ?? '',
          }

          // Converter para o formato do Supabase (snake_case)
          const professionalData = convertToSupabaseProfessional(professionalWithRequiredFields)

          console.log('Enviando dados para o serviço de profissionais');
          const { data, error } = await professionalService.addProfessional(professionalData)
          
          if (error) {
            console.error('Erro retornado pelo serviço de profissionais:', { 
              message: error.message,
              code: error.code,
              details: error.details
            });
            
            // Tratamento de erros específicos
            if (error.code === '23505') {
              throw new Error('Este profissional já existe no sistema. Verifique CPF ou email.');
            } else if (error.code === 'TIMEOUT' || error.message.includes('tempo limite')) {
              throw new Error('A operação demorou muito tempo. Verifique sua conexão e tente novamente.');
            } else if (error.code === 'MAX_RETRIES_EXCEEDED') {
              throw new Error('Não foi possível completar a operação após várias tentativas. Tente novamente mais tarde.');
            } else {
              throw error;
            }
          }

          if (data?.[0]) {
            console.log('Profissional adicionado com sucesso, atualizando store');
            // Converter de volta para camelCase
            const newProfessional = convertToAppProfessional(data[0] as SupabaseProfessional)

            set((state) => ({
              professionals: [...state.professionals, newProfessional],
            }))

            return newProfessional
          } else {
            console.warn('Resposta sem dados ao adicionar profissional');
            throw new Error('Não foi possível adicionar o profissional. Tente novamente.');
          }
        } catch (error) {
          console.error('Erro ao adicionar profissional (store):', error);
          // Rethrow para que a UI possa tratar o erro
          throw error instanceof Error 
            ? error 
            : new Error('Erro desconhecido ao adicionar profissional');
        } finally {
          console.log('Finalizando operação de adição de profissional');
          set({ isLoading: false })
        }
      },
      updateProfessional: async (id, updates) => {
        try {
          set({ isLoading: true })

          // Converter camelCase para snake_case para o Supabase
          const updateData: Partial<SupabaseProfessional> = {}
          if (updates.name !== undefined) updateData.name = updates.name
          if (updates.role !== undefined) updateData.role = updates.role
          if (updates.status !== undefined) updateData.status = updates.status
          if (updates.startDate !== undefined) updateData.start_date = updates.startDate
          if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl
          if (updates.cpf !== undefined) updateData.cpf = updates.cpf
          if (updates.birthDate !== undefined) updateData.birth_date = updates.birthDate
          if (updates.workHours !== undefined) updateData.work_hours = updates.workHours
          if (updates.workCity !== undefined) updateData.work_city = updates.workCity
          if (updates.salary !== undefined) updateData.salary = updates.salary
          if (updates.address !== undefined) updateData.address = updates.address
          if (updates.phone !== undefined) updateData.phone = updates.phone
          if (updates.email !== undefined) updateData.email = updates.email

          const { data, error } = await professionalService.updateProfessional(id, updateData)
          if (error) throw error

          if (data?.[0]) {
            // Atualizar o estado local com os dados retornados
            const updatedProfessional = convertToAppProfessional(data[0] as SupabaseProfessional)

            set((state) => ({
              professionals: state.professionals.map((p) =>
                p.id === id ? updatedProfessional : p,
              ),
            }))

            return updatedProfessional
          }
          return null
        } catch (error) {
          console.error('Erro ao atualizar profissional:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
      removeProfessional: async (id) => {
        try {
          set({ isLoading: true })
          const { error } = await professionalService.removeProfessional(id)
          if (error) throw error

          set((state) => ({
            professionals: state.professionals.filter((p) => p.id !== id),
          }))
        } catch (error) {
          console.error('Erro ao remover profissional:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
      selectProfessional: (id) => {
        set({ selectedProfessionalId: id })
        if (id) {
          void get().fetchTimeRecords(id)
        }
      },

      // Time Records
      timeRecords: [],
      fetchTimeRecords: async (professionalId) => {
        try {
          const id = professionalId ?? get().selectedProfessionalId
          if (!id) return

          const { data, error } = await timeRecordService.getTimeRecordsForProfessional(id)
          if (error) {
            console.error('Erro ao buscar registros de tempo:', error)
            return
          }

          if (data) {
            // Converter os nomes das colunas de snake_case para camelCase
            const formattedData = data.map((r) => convertToAppTimeRecord(r as SupabaseTimeRecord))

            set({ timeRecords: formattedData })
          }
        } catch (error) {
          console.error('Erro ao buscar registros de tempo:', error)
        }
      },
      addTimeRecord: async (record) => {
        try {
          // Converter camelCase para snake_case para o Supabase
          const recordData = convertToSupabaseTimeRecord(record)

          const { data, error } = await timeRecordService.addTimeRecord(recordData)
          if (error) {
            console.error('Erro ao adicionar registro de tempo:', error)
            return
          }

          if (data?.[0]) {
            // Converter de volta para camelCase
            const newRecord = convertToAppTimeRecord(data[0] as SupabaseTimeRecord)

            set((state) => ({
              timeRecords: [...state.timeRecords, newRecord],
            }))
          }
        } catch (error) {
          console.error('Erro ao adicionar registro de tempo:', error)
        }
      },
      updateTimeRecord: async (id, updates) => {
        try {
          // Converter camelCase para snake_case para o Supabase
          const updateData: Partial<SupabaseTimeRecord> = {}
          if (updates.professionalId !== undefined)
            updateData.professional_id = updates.professionalId
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

          if (data?.[0]) {
            // Atualizar o estado local com os dados retornados
            const updatedRecord = convertToAppTimeRecord(data[0] as SupabaseTimeRecord)

            set((state) => ({
              timeRecords: state.timeRecords.map((r) => (r.id === id ? updatedRecord : r)),
            }))
          }
        } catch (error) {
          console.error('Erro ao atualizar registro de tempo:', error)
        }
      },
      removeTimeRecord: async (id) => {
        try {
          const { error } = await timeRecordService.removeTimeRecord(id)
          if (error) {
            console.error('Erro ao remover registro de tempo:', error)
            return
          }

          set((state) => ({
            timeRecords: state.timeRecords.filter((r) => r.id !== id),
          }))
        } catch (error) {
          console.error('Erro ao remover registro de tempo:', error)
        }
      },
      getTimeRecordsForProfessional: (professionalId) => {
        return get().timeRecords.filter((r) => r.professionalId === professionalId)
      },
      getTimeRecordsForDate: async (date) => {
        try {
          const { data, error } = await timeRecordService.getTimeRecordsForDate(date)
          if (error) {
            console.error('Erro ao buscar registros para a data:', error)
            return
          }

          if (data) {
            // Converter os nomes das colunas de snake_case para camelCase
            const formattedData = data.map((r) => convertToAppTimeRecord(r as SupabaseTimeRecord))

            set({ timeRecords: formattedData })
          }
        } catch (error) {
          console.error('Erro ao buscar registros para a data:', error)
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
