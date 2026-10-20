import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, Modal, PageHeader, Skeleton, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Textarea } from '../components';
import type { BadgeTone } from '../components';
import { approveRequest, declineRequest, getTimeOffRequests } from '../api/timeOff';
import type { TimeOffRequest, TimeOffStatus, TimeOffType } from '../api/timeOff';
import { locations } from '../data/locations';
import { staff } from '../data/staff';
import { cx } from '../lib/cx';
import { formatDay } from '../lib/dates';
import styles from './TimeOff.module.css';

const tabs: { status: TimeOffStatus; label: string }[] = [
  { status: 'pending', label: 'Pending' },
  { status: 'approved', label: 'Approved' },
  { status: 'declined', label: 'Declined' },
];

const typeLabels: Record<TimeOffType, string> = { vacation: 'Vacation', sick: 'Sick leave', personal: 'Personal' };
const statusTones: Record<TimeOffStatus, BadgeTone> = { pending: 'warning', approved: 'success', declined: 'danger' };

const yearFormat = new Intl.DateTimeFormat('en-GB', { year: 'numeric' });

function parseDay(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function dayCount(request: TimeOffRequest): number {
  return Math.round((parseDay(request.end).getTime() - parseDay(request.start).getTime()) / 86_400_000) + 1;
}

function formatRange(request: TimeOffRequest): string {
  const start = parseDay(request.start);
  const end = parseDay(request.end);
  const withYear = (date: Date) => `${formatDay(date)} ${yearFormat.format(date)}`;
  if (request.start === request.end) return formatDay(start);
  return start.getFullYear() === end.getFullYear() ? `${formatDay(start)} to ${formatDay(end)}` : `${withYear(start)} to ${withYear(end)}`;
}

export function TimeOff() {
  const [requests, setRequests] = useState<TimeOffRequest[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<TimeOffStatus>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);
  const [declining, setDeclining] = useState<TimeOffRequest | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  function load() {
    setLoadError(false);
    setRequests(null);
    getTimeOffRequests().then(setRequests, () => setLoadError(true));
  }

  useEffect(load, []);

  const counts = useMemo(() => {
    const result: Record<TimeOffStatus, number> = { pending: 0, approved: 0, declined: 0 };
    requests?.forEach((request) => result[request.status]++);
    return result;
  }, [requests]);

  const visible = useMemo(
    () => (requests ?? []).filter((request) => request.status === tab).sort((a, b) => a.start.localeCompare(b.start)),
    [requests, tab],
  );

  function replace(updated: TimeOffRequest) {
    setRequests((current) => current?.map((item) => (item.id === updated.id ? updated : item)) ?? current);
  }

  async function approve(request: TimeOffRequest) {
    setBusyId(request.id);
    setRowError(null);
    try {
      replace(await approveRequest(request.id));
    } catch {
      setRowError({ id: request.id, message: 'Could not approve this request. Try again.' });
    } finally {
      setBusyId(null);
    }
  }

  function openDecline(request: TimeOffRequest) {
    setDeclining(request);
    setReason('');
    setReasonError('');
  }

  async function confirmDecline() {
    if (!declining) return;
    if (!reason.trim()) {
      setReasonError('Add a reason so the employee knows why.');
      return;
    }
    setBusyId(declining.id);
    try {
      replace(await declineRequest(declining.id, reason));
      setDeclining(null);
    } catch {
      setReasonError('Could not decline this request. Try again.');
    } finally {
      setBusyId(null);
    }
  }

  const declineName = declining ? staff.find((member) => member.id === declining.staffId)?.name : '';

  return (
    <>
      <PageHeader
        title="Time off"
        description={requests ? `${counts.pending} ${counts.pending === 1 ? 'request is' : 'requests are'} waiting for your decision` : 'Review and decide on staff requests'}
      />

      <div className={styles.tabs} role="group" aria-label="Filter by status">
        {tabs.map((item) => (
          <button key={item.status} type="button" className={cx(styles.tab, tab === item.status && styles.tabActive)} aria-pressed={tab === item.status} onClick={() => setTab(item.status)}>
            {item.label}
            {requests ? <span className={styles.count}>{counts[item.status]}</span> : null}
          </button>
        ))}
      </div>

      <Card flush className={styles.results}>
        {loadError ? (
          <EmptyState
            icon="clock"
            title="Couldn't load time-off requests"
            description="Check your connection and try again."
            action={
              <Button variant="secondary" size="sm" onClick={load}>
                Retry
              </Button>
            }
          />
        ) : !requests ? (
          <div className={styles.loading} aria-busy="true" aria-label="Loading requests">
            {[0, 1, 2, 3].map((row) => (
              <Skeleton key={row} height="40px" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState icon="check" title={tab === 'pending' ? 'All caught up' : `No ${tab} requests`} description={tab === 'pending' ? 'There are no requests waiting for a decision.' : 'Requests you have handled will show up here.'} />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Employee</TableHeaderCell>
                <TableHeaderCell>Dates</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Note</TableHeaderCell>
                <TableHeaderCell>{tab === 'pending' ? 'Decision' : 'Status'}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((request) => {
                const member = staff.find((item) => item.id === request.staffId);
                const location = locations.find((item) => item.id === member?.locationId);
                const days = dayCount(request);
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <p className={styles.name}>{member?.name}</p>
                      <p className={styles.sub}>
                        {member?.role}, {location?.name}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className={styles.name}>{formatRange(request)}</p>
                      <p className={styles.sub}>
                        {days} {days === 1 ? 'day' : 'days'}
                      </p>
                    </TableCell>
                    <TableCell>{typeLabels[request.type]}</TableCell>
                    <TableCell>
                      <p className={styles.note}>{request.note || <span className={styles.sub}>No note</span>}</p>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' ? (
                        <div className={styles.actions}>
                          <Button variant="primary" size="sm" loading={busyId === request.id} disabled={busyId !== null} onClick={() => approve(request)} aria-label={`Approve ${member?.name}'s request`}>
                            Approve
                          </Button>
                          <Button variant="secondary" size="sm" disabled={busyId !== null} onClick={() => openDecline(request)} aria-label={`Decline ${member?.name}'s request`}>
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <Badge tone={statusTones[request.status]}>{request.status === 'approved' ? 'Approved' : 'Declined'}</Badge>
                      )}
                      {rowError?.id === request.id ? (
                        <p className={styles.error} role="alert">
                          {rowError.message}
                        </p>
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
        onClose={() => setDeclining(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeclining(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={busyId !== null && declining?.id === busyId} onClick={confirmDecline}>
              Decline request
            </Button>
          </>
        }
      >
        {declining ? (
          <>
            <p className={styles.modalIntro}>
              {declineName}, {formatRange(declining)} ({typeLabels[declining.type].toLowerCase()})
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
