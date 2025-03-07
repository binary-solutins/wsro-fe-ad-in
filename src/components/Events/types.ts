export interface Event {
    id?: string;
    title: string;
    level: 'regional' | 'national' | 'international' | 'startup';
  }