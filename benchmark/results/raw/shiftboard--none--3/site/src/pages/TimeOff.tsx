import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, PageHeader, Select, Skeleton, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Textarea, Modal } from '../components';
import type { BadgeTone } from '../components';
import { approveRequest, declineRequest, getTimeOffRequests } from '../api/timeOff';
import type { TimeOffRequest, TimeOffStatus, TimeOffType } from '../api/timeOff';
import { locations } from '../data/locations';
import { staff } from '../data/staff';
import { countDays, formatDateRange } from '../lib/dates';
import styles from './TimeOff.module.css';

type StatusFilter = TimeOffStatus | 'all';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
  { value: 'all', label: 'All requests' },
];

const statusTone: Record<TimeOffStatus, BadgeTone> = { pending: 'warning', approved: 'success', declined: 'danger' };
const typeLabel: Record<TimeOffType, string> = { vacation: 'Vacation', sick: 'Sick leave', personal: 'Personal' };

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}

export function TimeOff() {
  const [requests, setRequests] = useState<TimeOffRequest[] | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [declining, setDeclining] = useState<TimeOffRequest | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  useEffect(() => {
    getTimeOffRequests()
      .then(setRequests)
      .catch((err) => setError(errorMessage(err)));
  }, []);

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
    setError('');
    try {
      replace(await approveRequest(request.id));
    } catch (err) {
      setError(errorMessage(err));
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
      setReasonError('Enter a reason so the employee knows why.');
      return;
    }
    setBusyId(declining.id);
    setError('');
    try {
      replace(await declineRequest(declining.id, reason));
      setDeclining(null);
    } catch (err) {
      setReasonError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  const decliningMember = declining ? staff.find((member) => member.id === declining.staffId) : undefined;

  return (
    <>
      <PageHeader
        title="Time off"
        description={requests ? `${pendingCount} ${pendingCount === 1 ? 'request' : 'requests'} awaiting review` : 'Review staff time-off requests'}
      />

      <div className={styles.filters}>
        <Select id="timeoff-status" label="Status" value={filter} options={statusOptions} onChange={(event) => setFilter(event.target.value as StatusFilter)} />
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <Card flush>
        {requests === null ? (
          <div style={{ display: 'grid', gap: 'var(--space-3)', padding: 'var(--space-4)' }}>
            <Skeleton height="2rem" />
            <Skeleton height="2rem" />
            <Skeleton height="2rem" />
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon="clock"
            title={filter === 'pending' ? 'No requests awaiting review' : 'No requests found'}
            description={filter === 'pending' ? 'New time-off requests will show up here.' : 'Try a different status.'}
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
                <TableHeaderCell>
                  <span className={styles.visuallyHidden}>Actions</span>
                </TableHeaderCell>
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
                    <TableCell>
                      <p className={styles.name}>{member?.name ?? 'Unknown employee'}</p>
                      <p className={styles.sub}>{[member?.role, location?.name].filter(Boolean).join(' · ')}</p>
                    </TableCell>
                    <TableCell>{typeLabel[request.type]}</TableCell>
                    <TableCell>
                      <p>{formatDateRange(request.start, request.end)}</p>
                      <p className={styles.sub}>{days} {days === 1 ? 'day' : 'days'}</p>
                    </TableCell>
                    <TableCell>{request.note || <span className={styles.sub}>No note</span>}</TableCell>
                    <TableCell>
                      <Badge tone={statusTone[request.status]}>{request.status[0].toUpperCase() + request.status.slice(1)}</Badge>
                    </TableCell>
                    <TableCell>
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
        title="Decline time-off request"
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
              {decliningMember?.name}, {typeLabel[declining.type].toLowerCase()}, {formatDateRange(declining.start, declining.end)}.
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
            />
          </>
        ) : null}
      </Modal>
    </>
  );
}
