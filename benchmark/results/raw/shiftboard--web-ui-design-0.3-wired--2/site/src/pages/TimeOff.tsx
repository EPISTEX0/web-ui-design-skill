import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, Icon, PageHeader, Select, Skeleton, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Textarea, Modal } from '../components';
import type { BadgeTone } from '../components';
import { approveRequest, declineRequest, getTimeOffRequests } from '../api/timeOff';
import type { TimeOffRequest, TimeOffStatus, TimeOffType } from '../api/timeOff';
import { locations } from '../data/locations';
import { staff } from '../data/staff';
import { formatDay } from '../lib/dates';
import styles from './TimeOff.module.css';

type StatusFilter = TimeOffStatus | 'all';

const typeLabels: Record<TimeOffType, string> = { vacation: 'Vacation', sick: 'Sick leave', personal: 'Personal' };
const statusTones: Record<TimeOffStatus, BadgeTone> = { pending: 'accent', approved: 'success', declined: 'danger' };
const statusLabels: Record<TimeOffStatus, string> = { pending: 'Pending', approved: 'Approved', declined: 'Declined' };
const DAY_MS = 24 * 60 * 60 * 1000;

function parseDay(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatRange(request: TimeOffRequest): string {
  const start = parseDay(request.start);
  const end = parseDay(request.end);
  const year = (date: Date) => (date.getFullYear() === 2026 ? '' : ` ${date.getFullYear()}`);
  if (request.start === request.end) return `${formatDay(start)}${year(start)}`;
  return `${formatDay(start)}${year(start)} to ${formatDay(end)}${year(end)}`;
}

function countDays(request: TimeOffRequest): number {
  return Math.round((parseDay(request.end).getTime() - parseDay(request.start).getTime()) / DAY_MS) + 1;
}

export function TimeOff() {
  const [requests, setRequests] = useState<TimeOffRequest[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [declining, setDeclining] = useState<TimeOffRequest | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const load = useCallback(() => {
    setLoadError(false);
    setRequests(null);
    getTimeOffRequests().then(setRequests, () => setLoadError(true));
  }, []);

  useEffect(load, [load]);

  const replace = (next: TimeOffRequest) => setRequests((current) => current?.map((item) => (item.id === next.id ? next : item)) ?? null);

  const counts = useMemo(() => {
    const result = { all: requests?.length ?? 0, pending: 0, approved: 0, declined: 0 };
    requests?.forEach((item) => (result[item.status] += 1));
    return result;
  }, [requests]);

  const visible = useMemo(
    () => (requests ?? []).filter((item) => filter === 'all' || item.status === filter).sort((a, b) => a.start.localeCompare(b.start)),
    [requests, filter],
  );

  const filterOptions = [
    { value: 'pending', label: `Pending (${counts.pending})` },
    { value: 'approved', label: `Approved (${counts.approved})` },
    { value: 'declined', label: `Declined (${counts.declined})` },
    { value: 'all', label: `All requests (${counts.all})` },
  ];

  async function approve(request: TimeOffRequest) {
    setBusyId(request.id);
    setActionError('');
    try {
      replace(await approveRequest(request.id));
    } catch {
      setActionError(`Could not approve the request from ${staffName(request)}. Try again.`);
    } finally {
      setBusyId(null);
    }
  }

  function openDecline(request: TimeOffRequest) {
    setDeclining(request);
    setReason('');
    setReasonError('');
    setActionError('');
  }

  function closeDecline() {
    if (busyId) return;
    setDeclining(null);
  }

  async function confirmDecline() {
    if (!declining) return;
    if (!reason.trim()) {
      setReasonError('Give a reason so the employee knows why.');
      return;
    }
    setBusyId(declining.id);
    try {
      replace(await declineRequest(declining.id, reason));
      setDeclining(null);
    } catch {
      setReasonError('Could not decline the request. Try again.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Time off"
        description={requests ? `${counts.pending} ${counts.pending === 1 ? 'request is' : 'requests are'} waiting for review` : 'Review requests from your team'}
      />

      <div className={styles.filters}>
        <Select id="timeoff-status" label="Show" value={filter} options={filterOptions} onChange={(event) => setFilter(event.target.value as StatusFilter)} />
      </div>

      {actionError ? (
        <p className={styles.alert} role="alert">
          {actionError}
        </p>
      ) : null}

      <Card flush>
        {loadError ? (
          <EmptyState
            icon="clock"
            title="Time-off requests did not load"
            description="Check your connection and try again."
            action={
              <Button variant="secondary" size="sm" onClick={load}>
                Try again
              </Button>
            }
          />
        ) : requests === null ? (
          <div className={styles.skeletons} aria-busy="true" aria-label="Loading requests">
            {[0, 1, 2, 3].map((row) => (
              <Skeleton key={row} height="var(--space-10)" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon="check"
            title={filter === 'pending' ? 'All caught up' : 'No requests here'}
            description={filter === 'pending' ? 'There are no time-off requests waiting for a decision.' : 'No requests match this filter.'}
            action={
              filter !== 'all' ? (
                <Button variant="secondary" size="sm" onClick={() => setFilter('all')}>
                  Show all requests
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table className={styles.table}>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Employee</TableHeaderCell>
                <TableHeaderCell>Dates</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Note</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className={styles.actionsHead}>
                  <span className={styles.srOnly}>Actions</span>
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((request) => {
                const member = staff.find((item) => item.id === request.staffId);
                const days = countDays(request);
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <p className={styles.name}>{member?.name ?? 'Unknown employee'}</p>
                      <p className={styles.subtle}>
                        {`${member?.role}, ${locations.find((location) => location.id === member?.locationId)?.name}`}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className={styles.nowrap}>{formatRange(request)}</p>
                      <p className={styles.subtle}>{days} {days === 1 ? 'day' : 'days'}</p>
                    </TableCell>
                    <TableCell>{typeLabels[request.type]}</TableCell>
                    <TableCell className={styles.note}>{request.note || <span className={styles.subtle}>No note</span>}</TableCell>
                    <TableCell>
                      <Badge tone={statusTones[request.status]}>{statusLabels[request.status]}</Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' ? (
                        <div className={styles.actions}>
                          <Button variant="primary" size="sm" loading={busyId === request.id && !declining} disabled={busyId !== null} onClick={() => approve(request)} aria-label={`Approve request from ${member?.name}`}>
                            <Icon name="check" />
                            Approve
                          </Button>
                          <Button variant="secondary" size="sm" disabled={busyId !== null} onClick={() => openDecline(request)} aria-label={`Decline request from ${member?.name}`}>
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
            <p>
              {staffName(declining)}, {typeLabels[declining.type].toLowerCase()}, {formatRange(declining)}.
            </p>
            <Textarea
              id="timeoff-reason"
              label="Reason"
              hint="Shared with the employee."
              value={reason}
              error={reasonError}
              onChange={(event) => {
                setReason(event.target.value);
                setReasonError('');
              }}
            />
          </>
        ) : null}
      </Modal>
    </>
  );
}

function staffName(request: TimeOffRequest): string {
  return staff.find((item) => item.id === request.staffId)?.name ?? 'this employee';
}
