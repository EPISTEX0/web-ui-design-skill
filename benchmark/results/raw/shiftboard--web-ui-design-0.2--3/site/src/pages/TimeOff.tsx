import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, PageHeader, Select, Skeleton, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Textarea, Modal } from '../components';
import type { BadgeTone } from '../components';
import { approveRequest, declineRequest, getTimeOffRequests } from '../api/timeOff';
import type { TimeOffRequest, TimeOffStatus, TimeOffType } from '../api/timeOff';
import { locations } from '../data/locations';
import { staff } from '../data/staff';
import { formatDay } from '../lib/dates';
import styles from './TimeOff.module.css';

type StatusFilter = TimeOffStatus | 'all';

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
  { value: 'all', label: 'All requests' },
];

const statusTone: Record<TimeOffStatus, BadgeTone> = { pending: 'warning', approved: 'success', declined: 'danger' };
const typeLabel: Record<TimeOffType, string> = { vacation: 'Vacation', sick: 'Sick leave', personal: 'Personal' };

function parseDay(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatRange(start: string, end: string): string {
  const from = parseDay(start);
  const to = parseDay(end);
  const withYear = (date: Date) => `${formatDay(date)} ${date.getFullYear()}`;
  return start === end ? withYear(from) : `${formatDay(from)} to ${withYear(to)}`;
}

function countDays(start: string, end: string): number {
  return Math.round((parseDay(end).getTime() - parseDay(start).getTime()) / 86_400_000) + 1;
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}

export function TimeOff() {
  const [requests, setRequests] = useState<TimeOffRequest[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusFilter>('pending');
  const [locationId, setLocationId] = useState('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [declining, setDeclining] = useState<TimeOffRequest | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | undefined>();

  const load = useCallback(() => {
    setLoadError(null);
    getTimeOffRequests()
      .then(setRequests)
      .catch((error) => setLoadError(message(error)));
  }, []);

  useEffect(load, [load]);

  const rows = useMemo(() => {
    if (!requests) return [];
    return requests
      .filter((request) => status === 'all' || request.status === status)
      .filter((request) => locationId === 'all' || staff.find((member) => member.id === request.staffId)?.locationId === locationId)
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [requests, status, locationId]);

  const pendingCount = requests?.filter((request) => request.status === 'pending').length ?? 0;

  function replace(updated: TimeOffRequest) {
    setRequests((current) => current?.map((item) => (item.id === updated.id ? updated : item)) ?? null);
  }

  async function approve(request: TimeOffRequest) {
    setBusyId(request.id);
    setActionError(null);
    try {
      replace(await approveRequest(request.id));
    } catch (error) {
      setActionError(message(error));
    } finally {
      setBusyId(null);
    }
  }

  function openDecline(request: TimeOffRequest) {
    setDeclining(request);
    setReason('');
    setReasonError(undefined);
  }

  function closeDecline() {
    if (busyId) return;
    setDeclining(null);
  }

  async function confirmDecline() {
    if (!declining) return;
    if (!reason.trim()) {
      setReasonError('Enter a reason so the employee knows why.');
      return;
    }
    setBusyId(declining.id);
    try {
      replace(await declineRequest(declining.id, reason));
      setDeclining(null);
    } catch (error) {
      setReasonError(message(error));
    } finally {
      setBusyId(null);
    }
  }

  const locationOptions = [{ value: 'all', label: 'All locations' }, ...locations.map((location) => ({ value: location.id, label: location.name }))];
  const decliningStaff = declining ? staff.find((member) => member.id === declining.staffId) : undefined;

  return (
    <>
      <PageHeader
        title="Time off"
        description={requests ? `${pendingCount} ${pendingCount === 1 ? 'request' : 'requests'} awaiting review` : 'Review staff time-off requests'}
      />

      <div className={styles.filters}>
        <Select id="timeoff-status" label="Status" value={status} options={statusOptions} onChange={(event) => setStatus(event.target.value as StatusFilter)} />
        <Select id="timeoff-location" label="Location" value={locationId} options={locationOptions} onChange={(event) => setLocationId(event.target.value)} />
      </div>

      {actionError ? (
        <p className={styles.error} role="alert">
          {actionError}
        </p>
      ) : null}

      <Card flush>
        {loadError ? (
          <EmptyState
            title="Couldn't load time-off requests"
            description={loadError}
            action={
              <Button variant="secondary" size="sm" onClick={() => { setRequests(null); load(); }}>
                Try again
              </Button>
            }
          />
        ) : !requests ? (
          <div className={styles.skeletons} aria-busy="true" aria-label="Loading requests">
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon="clock"
            title={status === 'pending' ? 'All caught up' : 'No requests found'}
            description={status === 'pending' ? 'There are no pending time-off requests to review.' : 'Try a different status or location.'}
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Employee</TableHeaderCell>
                <TableHeaderCell>Dates</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Note</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>
                  <span className={styles.srOnly}>Actions</span>
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((request) => {
                const member = staff.find((item) => item.id === request.staffId);
                const days = countDays(request.start, request.end);
                const busy = busyId === request.id;
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <p className={styles.name}>{member?.name ?? 'Unknown staff'}</p>
                      <p className={styles.sub}>
                        {member ? `${member.role} · ${locations.find((location) => location.id === member.locationId)?.name}` : request.staffId}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p>{formatRange(request.start, request.end)}</p>
                      <p className={styles.sub}>{days} {days === 1 ? 'day' : 'days'}</p>
                    </TableCell>
                    <TableCell>{typeLabel[request.type]}</TableCell>
                    <TableCell>
                      <p className={styles.note}>{request.note || '—'}</p>
                    </TableCell>
                    <TableCell>
                      <Badge tone={statusTone[request.status]}>{request.status[0].toUpperCase() + request.status.slice(1)}</Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' ? (
                        <div className={styles.actions}>
                          <Button size="sm" variant="primary" loading={busy} disabled={busyId !== null} onClick={() => approve(request)} aria-label={`Approve request from ${member?.name ?? request.staffId}`}>
                            Approve
                          </Button>
                          <Button size="sm" variant="secondary" disabled={busyId !== null} onClick={() => openDecline(request)} aria-label={`Decline request from ${member?.name ?? request.staffId}`}>
                            Decline
                          </Button>
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Modal
        open={declining !== null}
        title="Decline time-off request"
        onClose={closeDecline}
        footer={
          <>
            <Button variant="ghost" onClick={closeDecline} disabled={busyId !== null}>
              Cancel
            </Button>
            <Button variant="danger" loading={busyId !== null} onClick={confirmDecline}>
              Decline request
            </Button>
          </>
        }
      >
        {declining ? (
          <>
            <p className={styles.modalIntro}>
              {decliningStaff?.name ?? 'This employee'} requested {formatRange(declining.start, declining.end)}.
            </p>
            <Textarea
              id="decline-reason"
              label="Reason"
              hint="Shared with the employee."
              value={reason}
              error={reasonError}
              onChange={(event) => {
                setReason(event.target.value);
                setReasonError(undefined);
              }}
            />
          </>
        ) : null}
      </Modal>
    </>
  );
}
