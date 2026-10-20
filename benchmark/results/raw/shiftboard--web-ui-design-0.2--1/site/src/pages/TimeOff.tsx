import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, Icon, Modal, PageHeader, Select, Skeleton, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Textarea } from '../components';
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

const typeLabels: Record<TimeOffType, string> = { vacation: 'Vacation', sick: 'Sick leave', personal: 'Personal' };
const statusTones: Record<TimeOffStatus, BadgeTone> = { pending: 'warning', approved: 'success', declined: 'danger' };

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

  useEffect(() => {
    let cancelled = false;
    getTimeOffRequests().then(
      (data) => !cancelled && setRequests(data),
      (error) => !cancelled && setLoadError(errorMessage(error)),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    if (!requests) return [];
    return requests
      .filter((request) => status === ALL || request.status === status)
      .map((request) => ({ request, member: staff.find((person) => person.id === request.staffId) }))
      .filter(({ member }) => locationId === ALL || member?.locationId === locationId)
      .sort((a, b) => a.request.start.localeCompare(b.request.start));
  }, [requests, status, locationId]);

  const pendingCount = requests?.filter((request) => request.status === 'pending').length ?? 0;

  function replace(updated: TimeOffRequest) {
    setRequests((current) => current?.map((item) => (item.id === updated.id ? updated : item)) ?? current);
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
      setReasonError('Give a reason so the employee knows why.');
      return;
    }
    setBusyId(declining.id);
    setReasonError(undefined);
    try {
      replace(await declineRequest(declining.id, reason));
      setDeclining(null);
    } catch (error) {
      setReasonError(errorMessage(error));
    } finally {
      setBusyId(null);
    }
  }

  const decliningName = declining ? staff.find((person) => person.id === declining.staffId)?.name : undefined;

  return (
    <>
      <PageHeader
        title="Time off"
        description={requests ? `${pendingCount} ${pendingCount === 1 ? 'request' : 'requests'} awaiting review` : 'Review staff time-off requests'}
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
          <EmptyState title="Couldn't load time-off requests" description={loadError} />
        ) : !requests ? (
          <div className={styles.skeletons} aria-busy="true">
            <Skeleton height="2.5rem" />
            <Skeleton height="2.5rem" />
            <Skeleton height="2.5rem" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon="check"
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
              {rows.map(({ request, member }) => {
                const days = countDays(request.start, request.end);
                const busy = busyId === request.id;
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <p className={styles.name}>{member?.name ?? 'Unknown staff member'}</p>
                      <p className={styles.sub}>
                        {member ? `${member.role} · ${locations.find((location) => location.id === member.locationId)?.name}` : request.staffId}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p>{formatDateRange(request.start, request.end)}</p>
                      <p className={styles.sub}>{days} {days === 1 ? 'day' : 'days'}</p>
                    </TableCell>
                    <TableCell>{typeLabels[request.type]}</TableCell>
                    <TableCell>
                      <p className={styles.note}>{request.note || '—'}</p>
                    </TableCell>
                    <TableCell>
                      <Badge tone={statusTones[request.status]}>{request.status[0].toUpperCase() + request.status.slice(1)}</Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' ? (
                        <div className={styles.actions}>
                          <Button size="sm" variant="primary" loading={busy} disabled={busyId !== null} onClick={() => approve(request)} aria-label={`Approve request from ${member?.name ?? request.staffId}`}>
                            <Icon name="check" />
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
            <p className={styles.summary}>
              {decliningName}, {formatDateRange(declining.start, declining.end)}
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
