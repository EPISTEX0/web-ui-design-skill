export type LocationId = 'quayside' | 'market-hall' | 'northgate';

export interface Location {
  id: LocationId;
  name: string;
  area: string;
}

export type StaffRole =
  | 'General manager'
  | 'Shift lead'
  | 'Sous chef'
  | 'Line cook'
  | 'Server'
  | 'Bartender'
  | 'Host'
  | 'Dishwasher';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  locationId: LocationId;
  contractHours: number;
}

export interface Shift {
  id: string;
  staffId: string;
  locationId: LocationId;
  day: number;
  start: string;
  end: string;
}
