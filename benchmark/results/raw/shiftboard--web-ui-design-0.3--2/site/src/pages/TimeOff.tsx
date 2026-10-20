import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, Modal, PageHeader, Select, Skeleton, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Textarea } from '../components';
import type { BadgeTone } from '../components';
import { approveRequest, declineRequest, getTimeOffRequests } from '../api/timeOff';
import type { TimeOffRequest, TimeOffStatus, TimeOffType } from '../api/timeOff';
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
  if (start === end) return formatDay(parseDay(start));
  return `${formatDay(parseDay(start))} to ${formatDay(parseDay(end))}`;
}

function dayCount(start: string, end: string): number {
  return Math.round((parseDay(end).getTime() - parseDay(start).getTime()) / 86_400_000) + 1;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export function TimeOff() {
  const [requests, setRequests] = useState<TimeOffRequest[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusFilter>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [declining, setDeclining] = useState<TimeOffRequest | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    getTimeOffRequests()
      .then((data) => {
        if (!cancelled) setRequests(data);
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(errorMessage(error));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pendingCount = requests?.filter((item) => item.status === 'pending').length ?? 0;

  const visible = useMemo(() => {
    if (!requests) return [];
    return requests
      .filter((item) => status === 'all' || item.status === status)
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [requests, status]);

  function replace(updated: TimeOffRequest) {
    setRequests((current) => current?.map((item) => (item.id === updated.id ? updated : item)) ?? null);
  }

  async function approve(request: TimeOffRequest) {
    setBusyId(request.id);
    setActionError(null);
    try {
      replace(await approveRequest(request.id));
    } catch (error) {
      setActionError(errorMessage(error));
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
    setActionError(null);
    try {
      replace(await declineRequest(declining.id, reason));
      setDeclining(null);
    } catch (error) {
      setReasonError(errorMessage(error));
    } finally {
      setBusyId(null);
    }
  }

  const decliningMember = declining ? staff.find((member) => member.id === declining.staffId) : undefined;

  function renderBody() {
    if (loadError) {
      return <EmptyState title="Couldn't load time-off requests" description={loadError} />;
    }
    if (!requests) {
      return (
        <div className={styles.loading} role="status" aria-label="Loading requests">
          {[0, 1, 2, 3].map((row) => (
            <Skeleton key={row} height="2.5rem" />
          ))}
        </div>
      );
    }
    if (visible.length === 0) {
      return (
        <EmptyState
          title={status === 'pending' ? 'No requests waiting' : 'No requests here'}
          description={status === 'pending' ? 'You are all caught up.' : 'Try a different status filter.'}
        />
      );
    }
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Employee</TableHeaderCell>
            <TableHeaderCell>Dates</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>
              <span className={styles.srOnly}>Actions</span>
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visible.map((request) => {
            const member = staff.find((item) => item.id === request.staffId);
            const days = dayCount(request.start, request.end);
            const busy = busyId === request.id;
            return (
              <TableRow key={request.id}>
                <TableCell>
                  <p className={styles.name}>{member?.name ?? 'Unknown staff'}</p>
                  <p className={styles.meta}>{member?.role}</p>
                  {request.note ? <p className={styles.note}>{request.note}</p> : null}
                </TableCell>
                <TableCell>
                  <p>{formatRange(request.start, request.end)}</p>
                  <p className={styles.meta}>{days === 1 ? '1 day' : `${days} days`}</p>
                </TableCell>
                <TableCell>{typeLabel[request.type]}</TableCell>
                <TableCell>
                  <Badge tone={statusTone[request.status]}>{request.status[0].toUpperCase() + request.status.slice(1)}</Badge>
                </TableCell>
                <TableCell>
                  {request.status === 'pending' ? (
                    <div className={styles.actions}>
                      <Button size="sm" variant="primary" loading={busy} disabled={busyId !== null} onClick={() => approve(request)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="secondary" disabled={busyId !== null} onClick={() => openDecline(request)}>
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
    );
  }

  return (
    <>
      <PageHeader title="Time off" description={requests ? `${pendingCount} ${pendingCount === 1 ? 'request' : 'requests'} awaiting review` : 'Review staff requests'} />

      <div className={styles.filters}>
        <Select id="timeoff-status" label="Status" value={status} options={statusOptions} onChange={(event) => setStatus(event.target.value as StatusFilter)} />
      </div>

      {actionError ? (
        <p className={styles.error} role="alert">
          {actionError}
        </p>
      ) : null}

      <Card flush>{renderBody()}</Card>

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
            <p className={styles.summary}>
              {decliningMember?.name}, {formatRange(declining.start, declining.end)}
            </p>
            <Textarea
              id="timeoff-reason"
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
