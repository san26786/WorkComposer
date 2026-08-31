export type Session = {
  _id: string;
  userId?: string;
  startTime: string;
  endTime: string;
  duration: number;
  date: string;
  team: string;
  type: "work" | "break";
  createdAt?: string;
  updatedAt?: string;
};