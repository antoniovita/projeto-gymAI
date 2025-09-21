export interface User {
  id: string;
  name: string;
  level: number;
  xp: number;
  achievements: string[]; // será serializado como JSON
  badges: string[]; // será serializado como JSON
}