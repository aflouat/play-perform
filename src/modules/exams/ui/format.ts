/** Display of slots in the centres' time zone (France). */
export const TIME_ZONE = 'Europe/Paris';

export const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit' });
export const endOf = (iso: string, minutes: number) => timeOf(new Date(new Date(iso).getTime() + minutes * 60_000).toISOString());
export const dayLabel = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
export const whenLabel = (iso: string) => new Date(iso).toLocaleString('fr-FR', { timeZone: TIME_ZONE, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
