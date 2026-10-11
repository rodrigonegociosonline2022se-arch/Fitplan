export type Goal = 'Emagrecer' | 'Ganhar massa muscular' | 'Definir o corpo';
export type Experience = 'Iniciante' | 'Intermediário' | 'Avançado';
export type TrainingPlace = 'Academia completa' | 'Academia de condomínio' | 'Casa com equipamentos' | 'Casa sem equipamentos';

export interface Profile {
  name: string;
  goal: Goal;
  daysPerWeek: 3 | 4 | 5 | 6;
  experience: Experience;
  place: TrainingPlace;
  onboardingComplete: boolean;
}
export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  sets: number;
  reps: string;
  rest: number;
  instructions: string[];
  errors: string[];
  alternative: string;
}
export interface SetLog { weight: string; reps: string; done: boolean }
export interface WorkoutLog {
  date: string;
  workoutName: string;
  duration: number;
  completedExercises: number;
  sets: number;
}
export interface MusicLink { id: string; title: string; url: string; category: string }
export interface ProgressEntry { id: string; date: string; weight: string; waist: string; note: string }
