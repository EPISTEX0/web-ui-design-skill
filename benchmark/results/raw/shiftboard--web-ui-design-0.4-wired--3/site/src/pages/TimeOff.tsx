import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, Modal, PageHeader, Skeleton, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Textarea } from '../components';
import type { BadgeTone } from '../components';
import { approveRequest, declineRequest, getTimeOffRequests } from '../api/timeOff';
import type { TimeOffRequest, TimeOffStatus, TimeOffType } from '../api/timeOff';
import { locations } from '../data/locations';
import { staff } from '../data/staff';
import { addDays, formatDay } from '../lib/dates';
import styles from './TimeOff.module.css';

const typeLabels: Record<TimeOffType, string> = { vacation: 'Vacation', sick: 'Sick leave', personal: 'Personal' };
const statusTones: Record<TimeOffStatus, BadgeTone> = { pending: 'warning', approved: 'success', declined: 'danger' };
const statusLabels: Record<TimeOffStatus, string> = { pending: 'Pending', approved: 'Approved', declined: 'Declined' };
const tabs: TimeOffStatus[] = ['pending', 'approved', 'declined'];

function parseDay(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatRange(request: TimeOffRequest): string {
  const start = parseDay(request.start);
  const end = parseDay(request.end);
  const yearOf = (date: Date) => (date.getFullYear() === 2026 ? '' : ` ${date.getFullYear()}`);
  if (request.start === request.end) return `${formatDay(start)}${yearOf(start)}`;
  return `${formatDay(start)}${yearOf(start)} to ${formatDay(end)}${yearOf(end)}`;
}

function countDays(request: TimeOffRequest): number {
  const start = parseDay(request.start);
  const end = parseDay(request.end);
  let days = 1;
  while (addDays(start, days - 1) < end) days += 1;
  return days;
}

export function TimeOff() {
  const [requests, setRequests] = useState<TimeOffRequest[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<TimeOffStatus>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [declining, setDeclining] = useState<TimeOffRequest | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | undefined>();

  function load() {
    setLoadError(false);
    setRequests(null);
    getTimeOffRequests().then(setRequests, () => setLoadError(true));
  }

  useEffect(load, []);

  const counts = useMemo(() => {
    const result: Record<TimeOffStatus, number> = { pending: 0, approved: 0, declined: 0 };
    requests?.forEach((request) => (result[request.status] += 1));
    return result;
  }, [requests]);

  const visible = useMemo(
    () =>
      (requests ?? [])
        .filter((request) => request.status === tab)
        .sort((a, b) => a.start.localeCompare(b.start)),
    [requests, tab],
  );

  function replace(updated: TimeOffRequest) {
    setRequests((current) => current?.map((item) => (item.id === updated.id ? updated : item)) ?? null);
  }

  async function approve(request: TimeOffRequest) {
    setBusyId(request.id);
    setActionError(null);
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
    setReasonError(undefined);
  }

  function closeDecline() {
    if (busyId) return;
    setDeclining(null);
  }

  async function confirmDecline() {
    if (!declining) return;
    if (!reason.trim()) {
      setReasonError('Enter a reason so the team member knows why.');
      return;
    }
    setBusyId(declining.id);
    setActionError(null);
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
        description={requests ? `${counts.pending} ${counts.pending === 1 ? 'request needs' : 'requests need'} a decision` : 'Review requests from your team'}
      />

      <div className={styles.tabs} role="group" aria-label="Filter by status">
        {tabs.map((status) => (
          <Button key={status} size="sm" variant={tab === status ? 'primary' : 'secondary'} aria-pressed={tab === status} onClick={() => setTab(status)}>
            {statusLabels[status]}
            {requests ? ` (${counts[status]})` : ''}
          </Button>
        ))}
      </div>

      {actionError ? (
        <p className={styles.error} role="alert">
          {actionError}
        </p>
      ) : null}

      <Card flush>
        {loadError ? (
          <EmptyState
            icon="clock"
            title="Time-off requests didn't load"
            description="Check your connection and try again."
            action={
              <Button variant="secondary" size="sm" onClick={load}>
                Retry
              </Button>
            }
          />
        ) : !requests ? (
          <div className={styles.loading} role="status" aria-label="Loading requests">
            {[0, 1, 2, 3].map((row) => (
              <Skeleton key={row} height="var(--space-10)" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon="check"
            title={tab === 'pending' ? 'All caught up' : `No ${tab} requests`}
            description={tab === 'pending' ? 'There are no time-off requests waiting for a decision.' : undefined}
          />
        ) : (
          <Table className={styles.stack}>
            <TableHead className={styles.head}>
              <TableRow>
                <TableHeaderCell>Person</TableHeaderCell>
                <TableHeaderCell>Dates</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Note</TableHeaderCell>
                <TableHeaderCell>{tab === 'pending' ? 'Decision' : 'Status'}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((request) => {
                const member = staff.find((item) => item.id === request.staffId);
                const days = countDays(request);
                return (
                  <TableRow key={request.id} className={styles.row}>
                    <TableCell>
                      <p className={styles.name}>{member?.name}</p>
                      <p className={styles.meta}>
                        {member?.role}, {locations.find((location) => location.id === member?.locationId)?.name}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className={styles.nowrap}>{formatRange(request)}</p>
                      <p className={styles.meta}>{days === 1 ? '1 day' : `${days} days`}</p>
                    </TableCell>
                    <TableCell className={styles.type}>{typeLabels[request.type]}</TableCell>
                    <TableCell className={styles.note}>{request.note || <span className={styles.meta}>No note</span>}</TableCell>
                    <TableCell className={styles.decision}>
                      {request.status === 'pending' ? (
                        <div className={styles.actions}>
                          <Button variant="primary" size="sm" loading={busyId === request.id} disabled={busyId !== null} onClick={() => approve(request)} aria-label={`Approve request from ${member?.name}`}>
                            Approve
                          </Button>
                          <Button size="sm" disabled={busyId !== null} onClick={() => openDecline(request)} aria-label={`Decline request from ${member?.name}`}>
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <Badge tone={statusTones[request.status]}>{statusLabels[request.status]}</Badge>
                      )}
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
            <Button variant="secondary" onClick={closeDecline} disabled={busyId !== null}>
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
            <p className={styles.modalSummary}>
              {staffName(declining)}, {formatRange(declining)} ({typeLabels[declining.type].toLowerCase()})
            </p>
            <Textarea
              id="decline-reason"
              label="Reason"
              hint="Shared with the team member."
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

function staffName(request: TimeOffRequest): string {
  return staff.find((item) => item.id === request.staffId)?.name ?? 'a team member';
}
