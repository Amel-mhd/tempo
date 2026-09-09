import { supabase } from '../lib/supabase'

export interface TimeEntry {
  id: string
  date: string
  startTime: string
  pauseStart: string
  pauseEnd: string
  endTime: string
  workedMinutes: number
  status: string
}

/* RÉCUPÉRER MES JOURNÉES */

export const getTimeEntries = async (): Promise<TimeEntry[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('work_date', {
      ascending: false,
    })

  if (error) {
    console.error(error)
    return []
  }

  return (data ?? []).map((entry) => ({
    id: entry.id,
    date: entry.work_date,
    startTime: entry.start_time,
    pauseStart: entry.pause_start,
    pauseEnd: entry.pause_end,
    endTime: entry.end_time,
    workedMinutes: entry.worked_minutes,
    status: entry.status,
  }))
}

/* ENREGISTRER / MODIFIER UNE JOURNÉE */

export const saveTimeEntry = async (
  entry: Omit<TimeEntry, 'id' | 'status'>
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Utilisateur non connecté')
  }

  const { error } = await supabase
    .from('time_entries')
    .upsert(
      {
        user_id: user.id,
        work_date: entry.date,
        start_time: entry.startTime,
        pause_start: entry.pauseStart,
        pause_end: entry.pauseEnd,
        end_time: entry.endTime,
        worked_minutes: entry.workedMinutes,
      },
      {
        onConflict: 'user_id,work_date',
      }
    )

  if (error) {
    throw error
  }
}

/* SUPPRIMER UNE JOURNÉE */

export const deleteTimeEntry = async (
  id: string
) => {
  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}