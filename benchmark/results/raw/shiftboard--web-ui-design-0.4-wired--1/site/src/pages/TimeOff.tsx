import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, Modal, PageHeader, Select, Skeleton, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Textarea } from '../components';
import type { BadgeTone } from '../components';
import { approveRequest, declineRequest, getTimeOffRequests } from '../api/timeOff';
import type { TimeOffRequest, TimeOffStatus, TimeOffType } from '../api/timeOff';
import { locations } from '../data/locations';
import { staff } from '../data/staff';
import { countIsoDays, formatIsoDay, formatIsoRange } from '../lib/dates';
import styles from './TimeOff.module.css';

const ALL = 'all';

const statusTone: Record<TimeOffStatus, BadgeTone> = { pending: 'accent', approved: 'success', declined: 'danger' };
const statusLabel: Record<TimeOffStatus, string> = { pending: 'Pending', approved: 'Approved', declined: 'Declined' };
const typeLabel: Record<TimeOffType, string> = { vacation: 'Vacation', sick: 'Sick leave', personal: 'Personal' };

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
  { value: ALL, label: 'All statuses' },
];
const locationOptions = [{ value: ALL, label: 'All locations' }, ...locations.map((location) => ({ value: location.id, label: location.name }))];

function staffName(id: string): string {
  return staff.find((member) => member.id === id)?.name ?? 'Unknown';
}

export function TimeOff() {
  const [requests, setRequests] = useState<TimeOffRequest[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState<string>('pending');
  const [locationId, setLocationId] = useState(ALL);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [declining, setDeclining] = useState<TimeOffRequest | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const load = useCallback(() => {
    setLoadError('');
    setRequests(null);
    getTimeOffRequests().then(setRequests, () => setLoadError('Time-off requests could not be loaded.'));
  }, []);

  useEffect(load, [load]);

  const pendingCount = requests?.filter((item) => item.status === 'pending').length ?? 0;

  const visible = useMemo(() => {
    if (!requests) return [];
    return requests
      .filter(
        (item) =>
          (status === ALL || item.status === status) &&
          (locationId === ALL || staff.find((member) => member.id === item.staffId)?.locationId === locationId),
      )
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [requests, status, locationId]);

  function replace(updated: TimeOffRequest) {
    setRequests((current) => current?.map((item) => (item.id === updated.id ? updated : item)) ?? null);
  }

  async function approve(request: TimeOffRequest) {
    setBusyId(request.id);
    setActionError('');
    try {
      replace(await approveRequest(request.id));
    } catch {
      setActionError(`Could not approve ${staffName(request.staffId)}'s request. Try again.`);
    } finally {
      setBusyId(null);
    }
  }

  function openDecline(request: TimeOffRequest) {
    setDeclining(request);
    setReason('');
    setReasonError('');
  }

  function closeDecline() {
    if (busyId) return;
    setDeclining(null);
  }

  async function confirmDecline() {
    if (!declining) return;
    if (!reason.trim()) {
      setReasonError('Give a reason so the team member knows why.');
      return;
    }
    setBusyId(declining.id);
    setActionError('');
    try {
      replace(await declineRequest(declining.id, reason));
      setDeclining(null);
    } catch {
      setReasonError('The request could not be declined. Try again.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Time off"
        description={requests ? (pendingCount === 0 ? 'No requests waiting for a decision' : `${pendingCount} ${pendingCount === 1 ? 'request' : 'requests'} waiting for a decision`) : 'Review staff time-off requests'}
      />

      <div className={styles.filters}>
        <Select id="timeoff-status" label="Status" value={status} options={statusOptions} onChange={(event) => setStatus(event.target.value)} />
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
            icon="clock"
            title={loadError}
            description="Check your connection and try again."
            action={
              <Button variant="secondary" size="sm" onClick={load}>
                Retry
              </Button>
            }
          />
        ) : !requests ? (
          <div className={styles.loading} aria-busy="true" aria-label="Loading requests">
            <Skeleton height="var(--space-8)" />
            <Skeleton height="var(--space-8)" />
            <Skeleton height="var(--space-8)" />
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon="check"
            title={status === 'pending' ? 'All caught up' : 'No requests match these filters'}
            description={status === 'pending' ? 'There are no pending time-off requests for this selection.' : 'Try a different status or location.'}
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
          <Table className={styles.stack}>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Person</TableHeaderCell>
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
                const days = countIsoDays(request.start, request.end);
                const busy = busyId === request.id;
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <p className={styles.name}>{member?.name ?? 'Unknown'}</p>
                      <p className={styles.sub}>
                        {member?.role} · {locations.find((location) => location.id === member?.locationId)?.name}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p>{formatIsoRange(request.start, request.end)}</p>
                      <p className={styles.sub}>
                        {days} {days === 1 ? 'day' : 'days'} · requested {formatIsoDay(request.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell>{typeLabel[request.type]}</TableCell>
                    <TableCell>
                      <p className={styles.note}>{request.note || <span className={styles.sub}>No note</span>}</p>
                    </TableCell>
                    <TableCell>
                      <Badge tone={statusTone[request.status]}>{statusLabel[request.status]}</Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' ? (
                        <div className={styles.actions}>
                          <Button variant="primary" size="sm" loading={busy} disabled={busyId !== null} onClick={() => approve(request)} aria-label={`Approve ${member?.name}'s request`}>
                            Approve
                          </Button>
                          <Button variant="secondary" size="sm" disabled={busyId !== null} onClick={() => openDecline(request)} aria-label={`Decline ${member?.name}'s request`}>
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
            <p className={styles.summary}>
              {staffName(declining.staffId)} · {typeLabel[declining.type]} · {formatIsoRange(declining.start, declining.end)}
            </p>
            <Textarea
              id="decline-reason"
              label="Reason"
              hint="Shared with the team member."
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
