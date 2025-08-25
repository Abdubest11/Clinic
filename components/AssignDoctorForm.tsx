import { useEffect, useState } from "react";

export default function AssignDoctorForm() {
  const [formData, setFormData] = useState({ appointmentId: '', doctorId: '' });
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

 useEffect(() => {
    const fetchTodayRegistered = async () => {
      try {
        const res = await fetch('/api/todays-registered');
        if (res.ok) setAppointments(await res.json());
      } catch (err) {
        console.error('Failed to load today registered patients');
      }
    };
    fetchTodayRegistered();
  }, []);
useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await fetch('/api/doctors');
        if (res.ok) setDoctors(await res.json());
      } catch (err) {
        console.error('Failed to load today registered patients');
      }
    };
    fetchDoctor();
  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const appointmentId = parseInt(formData.appointmentId);
  const doctorId = formData.doctorId;

  if (isNaN(appointmentId)) {
    alert("Please select a valid appointment.");
    return;
  }
  if (!doctorId) {
    alert("Please select a doctor.");
    return;
  }

  const payload = { appointmentId, doctorId };
  console.log("📤 Sending payload:", payload);

  try {
    const res = await fetch("/api/appointments/assign-doctor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("📡 Response status:", res.status);
    console.log("📦 Response data:", data);

    if (res.ok) {
      alert("Doctor assigned successfully!");
      setFormData({ appointmentId: '', doctorId: '' }); // reset form
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (err) {
    console.error("🚨 Request failed:", err);
    alert("Network error. Check console for details.");
  }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-2 mt-4">
      <h2>Assign Doctor</h2>
      <select name="appointmentId" onChange={handleChange} required className="border p-1 block">
        <option value="">Select Patient </option>
        {appointments.map((app: any) => (
          <option key={app.id} value={app.id}>{app.name} - Appointment {app.id}</option>
        ))}
      </select>
      <select name="doctorId" onChange={handleChange} required className="border p-1 block">
        <option value="">Select Doctor</option>
        {doctors.map((doc: any) => (
          <option key={doc.id} value={doc.id}>{doc.name}</option>
        ))}
      </select>
      <button type="submit" className="bg-blue-500 text-white p-2">Assign</button>
    </form>
  );
}