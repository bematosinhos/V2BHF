import { supabase } from '../src/lib/supabase'
import { mockProfessionals, mockTimeRecords } from '../src/store'

/**
 * Script para criar as tabelas no Supabase e migrar os dados iniciais
 * Execute com: npx ts-node scripts/migration.ts
 */

// Função para criar as tabelas
async function createTables(): Promise<boolean> {
  console.log('Criando tabelas no Supabase...')

  // Cria tabela de profissionais
  const { error: professionalError } = await supabase.rpc('create_professionals_table', {})
  if (professionalError) {
    console.error('Erro ao criar tabela de profissionais:', professionalError)
    return false
  }

  // Cria tabela de registros de tempo
  const { error: timeRecordError } = await supabase.rpc('create_time_records_table', {})
  if (timeRecordError) {
    console.error('Erro ao criar tabela de registros de tempo:', timeRecordError)
    return false
  }

  console.log('Tabelas criadas com sucesso!')
  return true
}

// Função para migrar profissionais
async function migrateProfessionals(): Promise<boolean> {
  console.log('Migrando profissionais...')

  for (const professional of mockProfessionals) {
    const { error } = await supabase.from('professionals').insert({
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
    })

    if (error) {
      console.error(`Erro ao migrar profissional ${professional.name}:`, error)
      return false
    }
  }

  console.log(`${mockProfessionals.length} profissionais migrados com sucesso!`)
  return true
}

// Função para migrar registros de tempo
async function migrateTimeRecords(): Promise<boolean> {
  console.log('Migrando registros de tempo...')

  for (const record of mockTimeRecords) {
    const { error } = await supabase.from('time_records').insert({
      professional_id: record.professionalId,
      date: record.date,
      check_in: record.checkIn,
      check_out: record.checkOut,
      break_start: record.breakStart,
      break_end: record.breakEnd,
      type: record.type,
      notes: record.notes
    })

    if (error) {
      console.error(`Erro ao migrar registro de tempo para a data ${record.date}:`, error)
      return false
    }
  }

  console.log(`${mockTimeRecords.length} registros de tempo migrados com sucesso!`)
  return true
}

// Função principal
async function main(): Promise<void> {
  console.log('Iniciando migração de dados para o Supabase...')

  // As tabelas já devem estar criadas via SQL Editor no Supabase
  // Se quiser criar as tabelas via código, descomente a linha abaixo
  // await createTables()

  // Migra os dados
  const professionalsMigrated = await migrateProfessionals()
  if (!professionalsMigrated) {
    console.error('Falha na migração de profissionais')
    return
  }

  const timeRecordsMigrated = await migrateTimeRecords()
  if (!timeRecordsMigrated) {
    console.error('Falha na migração de registros de tempo')
    return
  }

  console.log('Migração concluída com sucesso!')
}

// Executa o script
void main().catch(err => {
  console.error('Erro ao executar migração:', err)
}) 