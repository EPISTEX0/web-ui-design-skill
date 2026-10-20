import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, Modal, PageHeader, Skeleton, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Textarea } from '../components';
import type { BadgeTone } from '../components';
import { approveRequest, declineRequest, getTimeOffRequests } from '../api/timeOff';
import type { TimeOffRequest, TimeOffStatus, TimeOffType } from '../api/timeOff';
import { staff } from '../data/staff';
import styles from './TimeOff.module.css';

type Filter = TimeOffStatus | 'all';

const filters: { value: Filter; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
  { value: 'all', label: 'All' },
];

const statusTone: Record<TimeOffStatus, BadgeTone> = { pending: 'warning', approved: 'success', declined: 'danger' };
const typeLabel: Record<TimeOffType, string> = { vacation: 'Vacation', sick: 'Sick leave', personal: 'Personal' };

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const dayFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

function parse(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatRange(start: string, end: string): string {
  if (start === end) return dateFormat.format(parse(start));
  return `${dayFormat.format(parse(start))} to ${dateFormat.format(parse(end))}`;
}

function countDays(start: string, end: string): number {
  return Math.round((parse(end).getTime() - parse(start).getTime()) / 86_400_000) + 1;
}

export function TimeOff() {
  const [requests, setRequests] = useState<TimeOffRequest[] | null>(null);
  const [filter, setFilter] = useState<Filter>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [declining, setDeclining] = useState<TimeOffRequest | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | undefined>();

  const load = useCallback(() => {
    setError(null);
    getTimeOffRequests().then(setRequests, () => setError('Could not load time-off requests.'));
  }, []);

  useEffect(load, [load]);

  const pendingCount = requests?.filter((item) => item.status === 'pending').length ?? 0;

  const visible = useMemo(() => {
    const list = (requests ?? []).filter((item) => filter === 'all' || item.status === filter);
    return list.sort((a, b) => a.start.localeCompare(b.start));
  }, [requests, filter]);

  function replace(updated: TimeOffRequest) {
    setRequests((current) => current?.map((item) => (item.id === updated.id ? updated : item)) ?? null);
  }

  async function approve(request: TimeOffRequest) {
    setBusyId(request.id);
    setError(null);
    try {
      replace(await approveRequest(request.id));
    } catch {
      setError('Could not approve the request. Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  function openDecline(request: TimeOffRequest) {
    setDeclining(request);
    setReason('');
    setReasonError(undefined);
  }

  async function confirmDecline() {
    if (!declining) return;
    if (!reason.trim()) {
      setReasonError('Enter a reason so the employee knows why.');
      return;
    }
    setBusyId(declining.id);
    setError(null);
    try {
      replace(await declineRequest(declining.id, reason));
      setDeclining(null);
    } catch {
      setReasonError('Could not decline the request. Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  const decliningStaff = declining ? staff.find((member) => member.id === declining.staffId) : undefined;

  return (
    <>
      <PageHeader
        title="Time off"
        description={requests ? `${pendingCount} ${pendingCount === 1 ? 'request' : 'requests'} awaiting review` : 'Review staff time-off requests'}
      />

      <div className={styles.filters} role="group" aria-label="Filter by status">
        {filters.map((item) => (
          <Button key={item.value} size="sm" variant={filter === item.value ? 'primary' : 'secondary'} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>
            {item.label}
          </Button>
        ))}
      </div>

      {error ? (
        <div className={styles.error} role="alert">
          {error}{' '}
          {!requests ? (
            <Button variant="ghost" size="sm" onClick={load}>
              Retry
            </Button>
          ) : null}
        </div>
      ) : null}

      <Card flush>
        {!requests ? (
          error ? null : (
            <div className={styles.skeletons} aria-busy="true">
              <Skeleton height={20} />
              <Skeleton height={20} />
              <Skeleton height={20} />
            </div>
          )
        ) : visible.length === 0 ? (
          <EmptyState
            icon="check"
            title={filter === 'pending' ? 'All caught up' : 'No requests here'}
            description={filter === 'pending' ? 'There are no time-off requests waiting for review.' : 'No requests match this status.'}
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
                <TableHeaderCell numeric>Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((request) => {
                const member = staff.find((item) => item.id === request.staffId);
                const days = countDays(request.start, request.end);
                const busy = busyId === request.id;
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <p className={styles.name}>{member?.name ?? 'Unknown employee'}</p>
                      <p className={styles.sub}>{member?.role}</p>
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
                    <TableCell numeric>
                      {request.status === 'pending' ? (
                        <div className={styles.actions}>
                          <Button size="sm" variant="primary" loading={busy} disabled={busyId !== null} onClick={() => approve(request)} aria-label={`Approve request from ${member?.name}`}>
                            Approve
                          </Button>
                          <Button size="sm" variant="secondary" disabled={busyId !== null} onClick={() => openDecline(request)} aria-label={`Decline request from ${member?.name}`}>
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
        title="Decline time off"
        onClose={() => setDeclining(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeclining(null)}>
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
              {decliningStaff?.name}, {formatRange(declining.start, declining.end)}
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
