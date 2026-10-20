import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Badge, Button, Card, EmptyState, Modal, PageHeader, Select, Skeleton, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Textarea } from '../components';
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

const typeLabels: Record<TimeOffType, string> = { vacation: 'Vacation', sick: 'Sick leave', personal: 'Personal' };
const statusTones: Record<TimeOffStatus, BadgeTone> = { pending: 'warning', approved: 'success', declined: 'danger' };
const statusLabels: Record<TimeOffStatus, string> = { pending: 'Pending', approved: 'Approved', declined: 'Declined' };

export function TimeOff() {
  const [requests, setRequests] = useState<TimeOffRequest[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [declining, setDeclining] = useState<TimeOffRequest | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | undefined>();

  const load = useCallback(() => {
    setLoadError(null);
    getTimeOffRequests().then(setRequests, (error: unknown) => setLoadError(error instanceof Error ? error.message : 'Could not load requests'));
  }, []);

  useEffect(load, [load]);

  const pendingCount = requests?.filter((item) => item.status === 'pending').length ?? 0;

  const visible = useMemo(() => {
    if (!requests) return [];
    const list = filter === 'all' ? requests : requests.filter((item) => item.status === filter);
    return [...list].sort((a, b) => a.start.localeCompare(b.start));
  }, [requests, filter]);

  function replace(updated: TimeOffRequest) {
    setRequests((current) => current?.map((item) => (item.id === updated.id ? updated : item)) ?? current);
  }

  async function approve(request: TimeOffRequest) {
    setBusyId(request.id);
    setActionError(null);
    try {
      replace(await approveRequest(request.id));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not approve the request');
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

  async function confirmDecline(event?: FormEvent) {
    event?.preventDefault();
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
    } catch (error) {
      setReasonError(error instanceof Error ? error.message : 'Could not decline the request');
    } finally {
      setBusyId(null);
    }
  }

  const declinedName = declining ? staff.find((member) => member.id === declining.staffId)?.name : undefined;

  return (
    <>
      <PageHeader
        title="Time off"
        description={requests ? `${pendingCount} ${pendingCount === 1 ? 'request' : 'requests'} awaiting review` : 'Review staff time-off requests'}
      />

      <div className={styles.filters}>
        <Select id="timeoff-status" label="Status" value={filter} options={statusOptions} onChange={(event) => setFilter(event.target.value as StatusFilter)} />
      </div>

      {actionError ? (
        <p className={styles.error} role="alert">
          {actionError}
        </p>
      ) : null}

      <Card flush>
        {loadError ? (
          <EmptyState
            title="Couldn't load requests"
            description={loadError}
            action={
              <Button variant="secondary" size="sm" onClick={load}>
                Try again
              </Button>
            }
          />
        ) : !requests ? (
          <div style={{ display: 'grid', gap: 'var(--space-3)', padding: 'var(--space-5)' }} role="status" aria-label="Loading requests">
            <Skeleton height="1.5rem" />
            <Skeleton height="1.5rem" />
            <Skeleton height="1.5rem" />
          </div>
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
                const busy = busyId === request.id;
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <p className={styles.name}>{member?.name ?? 'Unknown staff'}</p>
                      <p className={styles.sub}>{[member?.role, location?.name].filter(Boolean).join(' · ')}</p>
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
                      <Badge tone={statusTones[request.status]}>{statusLabels[request.status]}</Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' ? (
                        <div className={styles.actions}>
                          <Button variant="primary" size="sm" loading={busy} disabled={busyId !== null} onClick={() => approve(request)} aria-label={`Approve ${member?.name ?? 'request'}`}>
                            Approve
                          </Button>
                          <Button variant="secondary" size="sm" disabled={busyId !== null} onClick={() => openDecline(request)} aria-label={`Decline ${member?.name ?? 'request'}`}>
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
        title={declinedName ? `Decline ${declinedName}'s request` : 'Decline request'}
        onClose={closeDecline}
        footer={
          <>
            <Button variant="ghost" onClick={closeDecline} disabled={busyId !== null}>
              Cancel
            </Button>
            <Button variant="danger" loading={busyId !== null} onClick={() => confirmDecline()}>
              Decline request
            </Button>
          </>
        }
      >
        <form onSubmit={confirmDecline}>
          {declining ? <p className={styles.summary}>{formatDateRange(declining.start, declining.end)} · {typeLabels[declining.type]}</p> : null}
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
