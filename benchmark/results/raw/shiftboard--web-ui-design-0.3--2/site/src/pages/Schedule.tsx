import { useMemo, useState } from 'react';
import { Badge, Button, Card, Icon, PageHeader, Select, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components';
import { locations } from '../data/locations';
import { shifts } from '../data/shifts';
import { staff } from '../data/staff';
import { addDays, formatDay, formatWeekRange, formatWeekday, shiftHours, WEEK_ONE_START } from '../lib/dates';
import type { LocationId } from '../types';
import styles from './Schedule.module.css';

const locationOptions = locations.map((location) => ({ value: location.id, label: location.name }));

function shiftTone(start: string): 'warning' | 'accent' {
  return Number(start.slice(0, 2)) < 14 ? 'warning' : 'accent';
}

export function Schedule() {
  const [locationId, setLocationId] = useState<LocationId>('quayside');
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = addDays(WEEK_ONE_START, weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  const team = useMemo(() => staff.filter((member) => member.locationId === locationId), [locationId]);
  const locationShifts = useMemo(() => shifts.filter((shift) => shift.locationId === locationId), [locationId]);
  const totalHours = locationShifts.reduce((sum, shift) => sum + shiftHours(shift.start, shift.end), 0);

  return (
    <>
      <PageHeader
        title="Schedule"
        description={`Week of ${formatWeekRange(weekStart)}`}
        actions={
          <>
            <Button variant="secondary" size="sm" aria-label="Previous week" onClick={() => setWeekOffset(weekOffset - 1)}>
              <Icon name="chevronLeft" />
            </Button>
            <Button variant="secondary" size="sm" aria-label="Next week" onClick={() => setWeekOffset(weekOffset + 1)}>
              <Icon name="chevronRight" />
            </Button>
            <Button variant="primary" size="sm">
              Publish week
            </Button>
          </>
        }
      />

      <div className={styles.toolbar}>
        <div className={styles.location}>
          <Select
            id="schedule-location"
            label="Location"
            value={locationId}
            options={locationOptions}
            onChange={(event) => setLocationId(event.target.value as LocationId)}
          />
        </div>
        <dl className={styles.stats}>
          <div>
            <dt>Shifts</dt>
            <dd>{locationShifts.length}</dd>
          </div>
          <div>
            <dt>Hours</dt>
            <dd>{totalHours}</dd>
          </div>
          <div>
            <dt>Team</dt>
            <dd>{team.length}</dd>
          </div>
        </dl>
      </div>

      <Card title={locations.find((location) => location.id === locationId)?.name} description="Published to the team on Friday" flush>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Team member</TableHeaderCell>
              {days.map((day) => (
                <TableHeaderCell key={day.toISOString()}>
                  {formatWeekday(day)} {formatDay(day)}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {team.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <p className={styles.person}>{member.name}</p>
                  <p className={styles.role}>{member.role}</p>
                </TableCell>
                {days.map((day, index) => {
                  const shift = locationShifts.find((item) => item.staffId === member.id && item.day === index);
                  return (
                    <TableCell key={day.toISOString()}>
                      {shift ? (
                        <Badge tone={shiftTone(shift.start)}>
                          {shift.start} to {shift.end}
                        </Badge>
                      ) : (
                        <span className={styles.off}>Off</span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
