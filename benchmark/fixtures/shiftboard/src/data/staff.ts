import type { StaffMember } from '../types';

export const staff: StaffMember[] = [
  { id: 's01', name: 'Dana Whitlock', email: 'dana.whitlock@shiftboard.example', role: 'General manager', locationId: 'quayside', contractHours: 40 },
  { id: 's02', name: 'Mateo Ibarra', email: 'mateo.ibarra@shiftboard.example', role: 'Sous chef', locationId: 'quayside', contractHours: 40 },
  { id: 's03', name: 'Priya Raman', email: 'priya.raman@shiftboard.example', role: 'Line cook', locationId: 'quayside', contractHours: 32 },
  { id: 's04', name: 'Jonas Lindqvist', email: 'jonas.lindqvist@shiftboard.example', role: 'Server', locationId: 'quayside', contractHours: 24 },
  { id: 's05', name: 'Amara Nwosu', email: 'amara.nwosu@shiftboard.example', role: 'Server', locationId: 'quayside', contractHours: 28 },
  { id: 's06', name: 'Theo Marchetti', email: 'theo.marchetti@shiftboard.example', role: 'Bartender', locationId: 'quayside', contractHours: 30 },
  { id: 's07', name: 'Lucia Ferreira', email: 'lucia.ferreira@shiftboard.example', role: 'Host', locationId: 'quayside', contractHours: 20 },
  { id: 's08', name: 'Kofi Mensah', email: 'kofi.mensah@shiftboard.example', role: 'Dishwasher', locationId: 'quayside', contractHours: 24 },
  { id: 's09', name: 'Hannah Vogel', email: 'hannah.vogel@shiftboard.example', role: 'Shift lead', locationId: 'quayside', contractHours: 36 },
  { id: 's10', name: 'Rafael Quintero', email: 'rafael.quintero@shiftboard.example', role: 'General manager', locationId: 'market-hall', contractHours: 40 },
  { id: 's11', name: 'Sienna Ashby', email: 'sienna.ashby@shiftboard.example', role: 'Sous chef', locationId: 'market-hall', contractHours: 40 },
  { id: 's12', name: 'Ibrahim Haddad', email: 'ibrahim.haddad@shiftboard.example', role: 'Line cook', locationId: 'market-hall', contractHours: 36 },
  { id: 's13', name: 'Maren Solberg', email: 'maren.solberg@shiftboard.example', role: 'Line cook', locationId: 'market-hall', contractHours: 24 },
  { id: 's14', name: 'Dev Patel', email: 'dev.patel@shiftboard.example', role: 'Server', locationId: 'market-hall', contractHours: 32 },
  { id: 's15', name: 'Chloe Beaumont', email: 'chloe.beaumont@shiftboard.example', role: 'Server', locationId: 'market-hall', contractHours: 20 },
  { id: 's16', name: 'Nikolai Petrov', email: 'nikolai.petrov@shiftboard.example', role: 'Bartender', locationId: 'market-hall', contractHours: 28 },
  { id: 's17', name: 'Yuki Tanabe', email: 'yuki.tanabe@shiftboard.example', role: 'Host', locationId: 'market-hall', contractHours: 16 },
  { id: 's18', name: 'Grace Oduya', email: 'grace.oduya@shiftboard.example', role: 'Shift lead', locationId: 'market-hall', contractHours: 36 },
  { id: 's19', name: 'Elias Brandt', email: 'elias.brandt@shiftboard.example', role: 'General manager', locationId: 'northgate', contractHours: 40 },
  { id: 's20', name: 'Noor Karimi', email: 'noor.karimi@shiftboard.example', role: 'Sous chef', locationId: 'northgate', contractHours: 38 },
  { id: 's21', name: 'Tomas Havel', email: 'tomas.havel@shiftboard.example', role: 'Line cook', locationId: 'northgate', contractHours: 30 },
  { id: 's22', name: 'Imogen Pryce', email: 'imogen.pryce@shiftboard.example', role: 'Server', locationId: 'northgate', contractHours: 24 },
  { id: 's23', name: 'Santiago Rojas', email: 'santiago.rojas@shiftboard.example', role: 'Bartender', locationId: 'northgate', contractHours: 32 },
  { id: 's24', name: 'Leila Haddock', email: 'leila.haddock@shiftboard.example', role: 'Server', locationId: 'northgate', contractHours: 16 },
  { id: 's25', name: 'Owen Tierney', email: 'owen.tierney@shiftboard.example', role: 'Dishwasher', locationId: 'northgate', contractHours: 20 },
];

export const staffRoles = Array.from(new Set(staff.map((member) => member.role)));
