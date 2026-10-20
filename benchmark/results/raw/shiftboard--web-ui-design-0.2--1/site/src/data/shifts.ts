import type { Shift, StaffMember } from '../types';
import { staff } from './staff';

const dayPatterns: number[][] = [
  [0, 1, 2, 3, 4],
  [1, 2, 3, 5, 6],
  [0, 2, 4, 5, 6],
  [2, 3, 4, 5],
  [0, 1, 5, 6],
  [3, 4, 5, 6],
  [0, 1, 2],
  [4, 5, 6],
];

const kitchenRoles = ['Sous chef', 'Line cook', 'Dishwasher'];

function shiftTimes(member: StaffMember, day: number, slot: number): [string, string] {
  const weekend = day >= 4;
  if (kitchenRoles.includes(member.role)) {
    return slot % 2 === 0 ? ['09:00', '17:00'] : ['15:00', '23:00'];
  }
  if (member.role === 'Bartender') return weekend ? ['16:00', '00:00'] : ['15:00', '23:00'];
  if (member.role === 'Host') return ['17:00', '22:00'];
  if (member.role === 'General manager') return ['10:00', '18:30'];
  return slot % 2 === 0 ? ['11:30', '19:30'] : ['16:00', '00:00'];
}

function buildShifts(): Shift[] {
  const shifts: Shift[] = [];
  staff.forEach((member, index) => {
    const days = dayPatterns[index % dayPatterns.length];
    days.forEach((day, slot) => {
      const [start, end] = shiftTimes(member, day, slot + index);
      shifts.push({
        id: `${member.id}-d${day}`,
        staffId: member.id,
        locationId: member.locationId,
        day,
        start,
        end,
      });
    });
  });
  return shifts;
}

export const shifts: Shift[] = buildShifts();
