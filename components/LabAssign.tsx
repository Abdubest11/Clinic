// components/LabAssign.tsx
'use client';

import { useEffect, useState } from 'react';
import { AssignedPatient } from '@/types/appointment';

interface User {
  id: string;
  name: string;
  email: string;
}

interface LabService {
  id: number;
  name: string;
}

interface Props {
  selectedAppointment: AssignedPatient | null;
  services: LabService[];
}

export default function LabAssign({ selectedAppointment, services }: Props) {
  const [laboratorists, setLaboratorists] = useState<User[]>([]);
  const [laboratoristId, setLaboratoristId] = useState<string>('');
  const [serviceIds, setServiceIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLaboratorists = async () => {
      try {
        const res = await fetch('/api/users?role=LABORATORIST');
        if (!res.ok) throw new Error('Failed to fetch laboratorists');
        const data: User[] = await res.json();
        setLaboratorists(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLaboratorists();
  }, []);

  const handleAssign = async () => {
    if (!selectedAppointment || !laboratoristId || serviceIds.length === 0) {
      alert('Please select all fields.');
      return;
    }

    try {
      const res = await fetch('/api/lab-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppointment.id,
          serviceIds,
          laboratoristId,
        }),
      });

      if (res.ok) {
        alert('Lab tests assigned!');
        setServiceIds([]);
        setLaboratoristId('');
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      alert('Network error');
    }
  };

  if (!selectedAppointment) return null;
  if (loading) return <p>Loading laboratorists...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="mt-8 p-6 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Assign Lab Tests</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select Laboratorist</label>
        <select
          value={laboratoristId}
          onChange={(e) => setLaboratoristId(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Choose --</option>
          {laboratorists.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} ({l.email})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select Lab Tests</label>
        <select
          multiple
          value={serviceIds.map(String)}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, (o) => parseInt(o.value, 10));
            setServiceIds(selected);
          }}
          className="w-full p-2 border rounded h-32"
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleAssign}
        disabled={!laboratoristId || serviceIds.length === 0}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        Assign to Laboratorist
      </button>
    </div>
  );
}