export type TimeOffType = 'vacation' | 'sick' | 'personal';
export type TimeOffStatus = 'pending' | 'approved' | 'declined';

export interface TimeOffRequest {
  id: string;
  staffId: string;
  type: TimeOffType;
  start: string;
  end: string;
  note: string;
  status: TimeOffStatus;
  createdAt: string;
}

const LATENCY_MS = 400;

let requests: TimeOffRequest[] = [
  { id: 'to-101', staffId: 's04', type: 'vacation', start: '2026-11-02', end: '2026-11-08', note: 'Family wedding abroad, flights already booked.', status: 'pending', createdAt: '2026-10-06T09:14:00Z' },
  { id: 'to-102', staffId: 's11', type: 'sick', start: '2026-10-21', end: '2026-10-22', note: 'Doctor advised two days of rest.', status: 'pending', createdAt: '2026-10-19T07:40:00Z' },
  { id: 'to-103', staffId: 's06', type: 'personal', start: '2026-11-13', end: '2026-11-13', note: 'Moving flat, need the Friday.', status: 'pending', createdAt: '2026-10-12T16:02:00Z' },
  { id: 'to-104', staffId: 's14', type: 'vacation', start: '2026-12-21', end: '2027-01-03', note: 'Christmas with family up north.', status: 'pending', createdAt: '2026-09-30T11:25:00Z' },
  { id: 'to-105', staffId: 's21', type: 'vacation', start: '2026-11-16', end: '2026-11-20', note: '', status: 'pending', createdAt: '2026-10-15T13:08:00Z' },
  { id: 'to-106', staffId: 's09', type: 'personal', start: '2026-11-05', end: '2026-11-06', note: 'University graduation ceremony.', status: 'pending', createdAt: '2026-10-08T10:51:00Z' },
  { id: 'to-107', staffId: 's23', type: 'sick', start: '2026-10-26', end: '2026-10-28', note: 'Minor surgery, recovery time.', status: 'pending', createdAt: '2026-10-17T18:33:00Z' },
  { id: 'to-108', staffId: 's02', type: 'vacation', start: '2026-10-12', end: '2026-10-16', note: 'Week away at the coast.', status: 'approved', createdAt: '2026-09-02T08:20:00Z' },
  { id: 'to-109', staffId: 's17', type: 'personal', start: '2026-10-30', end: '2026-10-30', note: 'Driving test.', status: 'approved', createdAt: '2026-10-01T15:45:00Z' },
  { id: 'to-110', staffId: 's20', type: 'vacation', start: '2026-11-23', end: '2026-11-27', note: 'Visiting parents.', status: 'approved', createdAt: '2026-10-03T12:12:00Z' },
  { id: 'to-111', staffId: 's13', type: 'vacation', start: '2026-12-24', end: '2026-12-26', note: 'Holiday weekend away.', status: 'declined', createdAt: '2026-09-18T09:00:00Z' },
  { id: 'to-112', staffId: 's25', type: 'personal', start: '2026-11-27', end: '2026-11-28', note: 'Friend\'s birthday trip.', status: 'declined', createdAt: '2026-10-09T17:30:00Z' },
];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function find(id: string): TimeOffRequest {
  const request = requests.find((item) => item.id === id);
  if (!request) throw new Error(`Time-off request ${id} not found`);
  return request;
}

function update(id: string, status: TimeOffStatus): TimeOffRequest {
  const current = find(id);
  const next: TimeOffRequest = { ...current, status };
  requests = requests.map((item) => (item.id === id ? next : item));
  return { ...next };
}

export async function getTimeOffRequests(): Promise<TimeOffRequest[]> {
  await wait(LATENCY_MS);
  return requests.map((item) => ({ ...item }));
}

export async function approveRequest(id: string): Promise<TimeOffRequest> {
  await wait(LATENCY_MS);
  return update(id, 'approved');
}

export async function declineRequest(id: string, reason: string): Promise<TimeOffRequest> {
  if (!reason.trim()) {
    throw new Error('A reason is required to decline a time-off request');
  }
  await wait(LATENCY_MS);
  return update(id, 'declined');
}
