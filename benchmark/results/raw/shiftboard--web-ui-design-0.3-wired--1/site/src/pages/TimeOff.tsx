import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, PageHeader, Select, Skeleton, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Textarea, Modal } from '../components';
import type { BadgeTone } from '../components';
import { approveRequest, declineRequest, getTimeOffRequests } from '../api/timeOff';
import type { TimeOffRequest, TimeOffStatus, TimeOffType } from '../api/timeOff';
import { locations } from '../data/locations';
import { staff } from '../data/staff';
import { countDays, formatDateRange } from '../lib/dates';
import styles from './TimeOff.module.css';

const ALL = 'all';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
  { value: ALL, label: 'All statuses' },
];
const locationOptions = [{ value: ALL, label: 'All locations' }, ...locations.map((location) => ({ value: location.id, label: location.name }))];

const statusTone: Record<TimeOffStatus, BadgeTone> = { pending: 'accent', approved: 'success', declined: 'danger' };
const statusLabel: Record<TimeOffStatus, string> = { pending: 'Pending', approved: 'Approved', declined: 'Declined' };
const typeLabel: Record<TimeOffType, string> = { vacation: 'Vacation', sick: 'Sick leave', personal: 'Personal' };

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export function TimeOff() {
  const [requests, setRequests] = useState<TimeOffRequest[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('pending');
  const [locationId, setLocationId] = useState(ALL);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [declining, setDeclining] = useState<TimeOffRequest | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | undefined>();

  const load = useCallback(() => {
    setLoadError(null);
    setRequests(null);
    getTimeOffRequests()
      .then(setRequests)
      .catch((error: unknown) => setLoadError(errorMessage(error)));
  }, []);

  useEffect(load, [load]);

  const pendingCount = requests?.filter((item) => item.status === 'pending').length ?? 0;

  const visible = useMemo(() => {
    if (!requests) return [];
    return requests
      .filter((item) => {
        const member = staff.find((person) => person.id === item.staffId);
        return (status === ALL || item.status === status) && (locationId === ALL || member?.locationId === locationId);
      })
      .sort((a, b) => (a.status === 'pending' ? a.start.localeCompare(b.start) : b.createdAt.localeCompare(a.createdAt)));
  }, [requests, status, locationId]);

  function replace(next: TimeOffRequest) {
    setRequests((current) => current?.map((item) => (item.id === next.id ? next : item)) ?? current);
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
      setReasonError('Give a short reason so the staff member knows why.');
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

  const decliningMember = declining ? staff.find((person) => person.id === declining.staffId) : undefined;
  const description = requests ? (pendingCount === 0 ? 'No requests waiting for a decision' : `${pendingCount} ${pendingCount === 1 ? 'request' : 'requests'} waiting for a decision`) : 'Review and decide on staff requests';

  return (
    <>
      <PageHeader title="Time off" description={description} />

      <div className={styles.filters}>
        <Select id="timeoff-status" label="Status" value={status} options={statusOptions} onChange={(event) => setStatus(event.target.value)} />
        <Select id="timeoff-location" label="Location" value={locationId} options={locationOptions} onChange={(event) => setLocationId(event.target.value)} />
      </div>

      {actionError ? (
        <p className={styles.error} role="alert">
          {actionError}
        </p>
      ) : null}

      <Card flush className={styles.card}>
        {loadError ? (
          <EmptyState
            icon="close"
            title="Could not load time-off requests"
            description={loadError}
            action={
              <Button variant="secondary" size="sm" onClick={load}>
                Try again
              </Button>
            }
          />
        ) : !requests ? (
          <div className={styles.skeletonRow} role="status" aria-label="Loading time-off requests">
            <Skeleton height="40px" />
            <Skeleton height="40px" />
            <Skeleton height="40px" />
            <Skeleton height="40px" />
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon="check"
            title={status === 'pending' ? 'All caught up' : 'No requests match these filters'}
            description={status === 'pending' ? 'There are no pending requests to review.' : 'Try a different status or location.'}
            action={
              status !== ALL || locationId !== ALL ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setStatus(ALL);
                    setLocationId(ALL);
                  }}
                >
                  Show all requests
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Staff</TableHeaderCell>
                <TableHeaderCell>Request</TableHeaderCell>
                <TableHeaderCell>Note</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className={styles.actionsHead}>
                  <span className={styles.srOnly}>Actions</span>
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((request) => {
                const member = staff.find((person) => person.id === request.staffId);
                const location = locations.find((item) => item.id === member?.locationId);
                const days = countDays(request.start, request.end);
                const busy = busyId === request.id;
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <p className={styles.name}>{member?.name ?? 'Unknown staff'}</p>
                      <p className={styles.meta}>
                        {member?.role} · {location?.name}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className={styles.dates}>{formatDateRange(request.start, request.end)}</p>
                      <div className={styles.type}>
                        <Badge>{typeLabel[request.type]}</Badge>
                        <span className={styles.meta}>
                          {days} {days === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={styles.note}>{request.note || <span className={styles.none}>No note</span>}</TableCell>
                    <TableCell>
                      <Badge tone={statusTone[request.status]}>{statusLabel[request.status]}</Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' ? (
                        <div className={styles.actions}>
                          <Button size="sm" disabled={busyId !== null && !busy} onClick={() => openDecline(request)} aria-label={`Decline request from ${member?.name}`}>
                            Decline
                          </Button>
                          <Button variant="primary" size="sm" loading={busy} disabled={busyId !== null && !busy} onClick={() => approve(request)} aria-label={`Approve request from ${member?.name}`}>
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
            <Button onClick={closeDecline} disabled={busyId !== null}>
              Cancel
            </Button>
            <Button variant="danger" loading={busyId !== null} onClick={confirmDecline}>
              Decline request
            </Button>
          </>
        }
      >
        {declining ? (
          <p className={styles.summary}>
            {decliningMember?.name}, {typeLabel[declining.type].toLowerCase()}, {formatDateRange(declining.start, declining.end)}
          </p>
        ) : null}
        <Textarea
          id="timeoff-reason"
          label="Reason"
          hint="Shared with the staff member."
          value={reason}
          error={reasonError}
          onChange={(event) => {
            setReason(event.target.value);
            setReasonError(undefined);
          }}
        />
      </Modal>
    </>
  );
}
