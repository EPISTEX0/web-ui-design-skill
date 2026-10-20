import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { approveRequest, declineRequest, getTimeOffRequests } from '../api/timeOff';
import type { TimeOffRequest, TimeOffStatus, TimeOffType } from '../api/timeOff';
import { Badge, Button, Card, EmptyState, Modal, PageHeader, Select, Skeleton, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Textarea } from '../components';
import type { BadgeTone } from '../components';
import { locations } from '../data/locations';
import { staff } from '../data/staff';
import { countDays, formatDateRange } from '../lib/dates';
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

export function TimeOff() {
  const [requests, setRequests] = useState<TimeOffRequest[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [declining, setDeclining] = useState<TimeOffRequest | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    getTimeOffRequests().then(
      (data) => {
        if (!cancelled) setRequests(data);
      },
      () => {
        if (!cancelled) setLoadError('Could not load time-off requests.');
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const pendingCount = requests?.filter((item) => item.status === 'pending').length ?? 0;

  const visible = useMemo(() => {
    if (!requests) return [];
    return requests
      .filter((item) => status === ALL || item.status === status)
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [requests, status]);

  function replace(updated: TimeOffRequest) {
    setRequests((current) => current?.map((item) => (item.id === updated.id ? updated : item)) ?? current);
  }

  async function approve(request: TimeOffRequest) {
    setBusyId(request.id);
    setActionError(null);
    try {
      replace(await approveRequest(request.id));
    } catch {
      setActionError('Could not approve the request. Please try again.');
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

  async function confirmDecline(event: FormEvent) {
    event.preventDefault();
    if (!declining) return;
    if (!reason.trim()) {
      setReasonError('Give a reason so the employee knows why.');
      return;
    }
    setBusyId(declining.id);
    setActionError(null);
    try {
      replace(await declineRequest(declining.id, reason));
      setDeclining(null);
    } catch {
      setReasonError('Could not decline the request. Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  const declineName = declining ? staff.find((member) => member.id === declining.staffId)?.name : undefined;

  return (
    <>
      <PageHeader
        title="Time off"
        description={requests ? `${pendingCount} ${pendingCount === 1 ? 'request' : 'requests'} awaiting review` : 'Review staff time-off requests'}
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
          <EmptyState icon="clock" title="Something went wrong" description={loadError} />
        ) : !requests ? (
          <div className={styles.skeletonRows} aria-busy="true" aria-label="Loading requests">
            <Skeleton height="2.5rem" />
            <Skeleton height="2.5rem" />
            <Skeleton height="2.5rem" />
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon="check"
            title={status === 'pending' ? 'All caught up' : 'No requests found'}
            description={status === 'pending' ? 'There are no time-off requests waiting for review.' : 'No requests match this status.'}
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
              {visible.map((request) => {
                const member = staff.find((item) => item.id === request.staffId);
                const location = locations.find((item) => item.id === member?.locationId);
                const days = countDays(request.start, request.end);
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <p className={styles.name}>{member?.name ?? 'Unknown'}</p>
                      <p className={styles.sub}>
                        {member?.role}
                        {location ? ` · ${location.name}` : ''}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p>{formatDateRange(request.start, request.end)}</p>
                      <p className={styles.sub}>{days} {days === 1 ? 'day' : 'days'}</p>
                    </TableCell>
                    <TableCell>{typeLabels[request.type]}</TableCell>
                    <TableCell>
                      <span className={styles.note}>{request.note || '—'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge tone={statusTones[request.status]}>{request.status[0].toUpperCase() + request.status.slice(1)}</Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' ? (
                        <div className={styles.actions}>
                          <Button size="sm" variant="primary" loading={busyId === request.id && !declining} disabled={busyId !== null} onClick={() => approve(request)}>
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
        )}
      </Card>

      <Modal
        open={declining !== null}
        title={declineName ? `Decline request from ${declineName}` : 'Decline request'}
        onClose={closeDecline}
        footer={
          <>
            <Button variant="secondary" onClick={closeDecline} disabled={busyId !== null}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" form="decline-form" loading={busyId !== null}>
              Decline request
            </Button>
          </>
        }
      >
        <form id="decline-form" onSubmit={confirmDecline} noValidate>
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
        </form>
      </Modal>
    </>
  );
}
