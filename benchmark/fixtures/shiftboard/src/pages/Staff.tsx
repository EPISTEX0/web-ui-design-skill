import { useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, Input, PageHeader, Select, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components';
import { locations } from '../data/locations';
import { staff, staffRoles } from '../data/staff';
import styles from './Staff.module.css';

const ALL = 'all';

const roleOptions = [{ value: ALL, label: 'All roles' }, ...staffRoles.map((role) => ({ value: role, label: role }))];
const locationOptions = [{ value: ALL, label: 'All locations' }, ...locations.map((location) => ({ value: location.id, label: location.name }))];

export function Staff() {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState(ALL);
  const [locationId, setLocationId] = useState(ALL);

  const filtered = useMemo(
    () =>
      staff.filter(
        (member) =>
          member.name.toLowerCase().includes(query.trim().toLowerCase()) &&
          (role === ALL || member.role === role) &&
          (locationId === ALL || member.locationId === locationId),
      ),
    [query, role, locationId],
  );

  function reset() {
    setQuery('');
    setRole(ALL);
    setLocationId(ALL);
  }

  return (
    <>
      <PageHeader title="Staff" description={`${staff.length} people across ${locations.length} locations`} />

      <div className={styles.filters}>
        <Input id="staff-search" label="Search" type="search" placeholder="Name" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select id="staff-role" label="Role" value={role} options={roleOptions} onChange={(event) => setRole(event.target.value)} />
        <Select id="staff-location" label="Location" value={locationId} options={locationOptions} onChange={(event) => setLocationId(event.target.value)} />
      </div>

      <Card flush>
        {filtered.length === 0 ? (
          <EmptyState
            title="No staff match these filters"
            description="Try a different name, role or location."
            action={
              <Button variant="secondary" size="sm" onClick={reset}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Location</TableHeaderCell>
                <TableHeaderCell>Contract</TableHeaderCell>
                <TableHeaderCell numeric>Hours / week</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <p className={styles.name}>{member.name}</p>
                    <p className={styles.email}>{member.email}</p>
                  </TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>{locations.find((location) => location.id === member.locationId)?.name}</TableCell>
                  <TableCell>
                    <Badge tone={member.contractHours >= 35 ? 'accent' : 'neutral'}>{member.contractHours >= 35 ? 'Full time' : 'Part time'}</Badge>
                  </TableCell>
                  <TableCell numeric>{member.contractHours}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  );
}
