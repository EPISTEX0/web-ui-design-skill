import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { approveRequest, declineRequest, getTimeOffRequests } from '../api/timeOff';
import type { TimeOffRequest, TimeOffStatus, TimeOffType } from '../api/timeOff';
import { Badge, Button, Card, EmptyState, Icon, Modal, PageHeader, Select, Skeleton, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Textarea } from '../components';
import type { BadgeTone } from '../components';
import { locations } from '../data/locations';
import { staff } from '../data/staff';
import { countDays, formatDateRange, formatDay, parseDate } from '../lib/dates';
import styles from './TimeOff.module.css';

const ALL = 'all';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
  { value: ALL, label: 'All requests' },
];

const typeLabels: Record<TimeOffType, string> = { vacation: 'Vacation', sick: 'Sick leave', personal: 'Personal' };
const statusTones: Record<TimeOffStatus, BadgeTone> = { pending: 'warning', approved: 'success', declined: 'danger' };
const statusLabels: Record<TimeOffStatus, string> = { pending: 'Pending', approved: 'Approved', declined: 'Declined' };

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
}

export function TimeOff() {
  const [requests, setRequests] = useState<TimeOffRequest[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [status, setStatus] = useState<string>('pending');
  const [busyId, setBusyId] = useState('');
  const [declining, setDeclining] = useState<TimeOffRequest | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  function load() {
    setLoadError('');
    setRequests(null);
    getTimeOffRequests().then(setRequests, (error) => setLoadError(errorMessage(error)));
  }

  useEffect(load, []);

  const visible = useMemo(() => {
    const list = (requests ?? []).filter((item) => status === ALL || item.status === status);
    // Pending: soonest start first, since those are the ones that need an answer first.
    return list.sort((a, b) => (status === 'pending' ? a.start.localeCompare(b.start) : b.createdAt.localeCompare(a.createdAt)));
  }, [requests, status]);

  const pendingCount = requests?.filter((item) => item.status === 'pending').length ?? 0;

  function replace(next: TimeOffRequest) {
    setRequests((current) => current?.map((item) => (item.id === next.id ? next : item)) ?? null);
  }

  async function approve(request: TimeOffRequest) {
    setActionError('');
    setBusyId(request.id);
    try {
      replace(await approveRequest(request.id));
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setBusyId('');
    }
  }

  function openDecline(request: TimeOffRequest) {
    setReason('');
    setReasonError('');
    setDeclining(request);
  }

  function closeDecline() {
    if (busyId) return;
    setDeclining(null);
  }

  async function submitDecline(event: FormEvent) {
    event.preventDefault();
    if (!declining) return;
    if (!reason.trim()) {
      setReasonError('Give a reason so the employee knows why.');
      return;
    }
    setBusyId(declining.id);
    try {
      replace(await declineRequest(declining.id, reason));
      setDeclining(null);
    } catch (error) {
      setReasonError(errorMessage(error));
    } finally {
      setBusyId('');
    }
  }

  const decliningMember = declining ? staff.find((member) => member.id === declining.staffId) : undefined;

  return (
    <>
      <PageHeader
        title="Time off"
        description={requests ? (pendingCount ? `${pendingCount} ${pendingCount === 1 ? 'request needs' : 'requests need'} a decision` : 'No requests waiting on you') : 'Review staff requests'}
      />

      <div className={styles.filters}>
        <Select id="timeoff-status" label="Status" value={status} options={statusOptions} onChange={(event) => setStatus(event.target.value)} />
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
            title="Couldn't load time-off requests"
            description={loadError}
            action={
              <Button variant="secondary" size="sm" onClick={load}>
                Try again
              </Button>
            }
          />
        ) : requests === null ? (
          <div className={styles.skeletons} aria-busy="true" aria-label="Loading requests">
            <Skeleton height="2.5rem" />
            <Skeleton height="2.5rem" />
            <Skeleton height="2.5rem" />
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon="check"
            title={status === 'pending' ? 'All caught up' : 'No requests here'}
            description={status === 'pending' ? 'There are no pending time-off requests.' : 'No requests match this status.'}
            action={
              status === ALL ? undefined : (
                <Button variant="secondary" size="sm" onClick={() => setStatus(ALL)}>
                  Show all requests
                </Button>
              )
            }
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Employee</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Dates</TableHeaderCell>
                <TableHeaderCell>Note</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell numeric>Decision</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((request) => {
                const member = staff.find((item) => item.id === request.staffId);
                const location = locations.find((item) => item.id === member?.locationId);
                const days = countDays(request.start, request.end);
                const busy = busyId === request.id;
                return (
                  <TableRow key={request.id}>
                    <TableCell className={styles.nowrap}>
                      <p className={styles.name}>{member?.name ?? 'Unknown staff'}</p>
                      <p className={styles.sub}>{[member?.role, location?.name].filter(Boolean).join(' · ')}</p>
                    </TableCell>
                    <TableCell>{typeLabels[request.type]}</TableCell>
                    <TableCell className={styles.nowrap}>
                      <p>{formatDateRange(request.start, request.end)}</p>
                      <p className={styles.sub}>
                        {days} {days === 1 ? 'day' : 'days'} · asked {formatDay(parseDate(request.createdAt.slice(0, 10)))}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className={styles.note}>{request.note || <span className={styles.sub}>No note</span>}</p>
                    </TableCell>
                    <TableCell>
                      <Badge tone={statusTones[request.status]}>{statusLabels[request.status]}</Badge>
                    </TableCell>
                    <TableCell className={styles.nowrap}>
                      {request.status === 'pending' ? (
                        <div className={styles.actions}>
                          <Button variant="secondary" size="sm" disabled={busy} onClick={() => openDecline(request)} aria-label={`Decline request from ${member?.name}`}>
                            Decline
                          </Button>
                          <Button variant="primary" size="sm" loading={busy} onClick={() => approve(request)} aria-label={`Approve request from ${member?.name}`}>
                            <Icon name="check" />
                            Approve
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
            <Button variant="secondary" onClick={closeDecline} disabled={Boolean(busyId)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" form="decline-form" loading={Boolean(busyId)}>
              Decline request
            </Button>
          </>
        }
      >
        {declining ? (
          <form id="decline-form" onSubmit={submitDecline} noValidate>
            <p className={styles.summary}>
              {decliningMember?.name}, {typeLabels[declining.type].toLowerCase()}, {formatDateRange(declining.start, declining.end)}
            </p>
            <Textarea
              id="decline-reason"
              label="Reason"
              hint="Shared with the employee."
              value={reason}
              error={reasonError}
              onChange={(event) => {
                setReason(event.target.value);
                setReasonError('');
              }}
              required
            />
          </form>
        ) : null}
      </Modal>
    </>
  );
}
