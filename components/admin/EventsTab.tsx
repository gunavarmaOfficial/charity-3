"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  X,
  Loader2,
  UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";

interface EventsTabProps {
  onRefresh: () => void;
}

export default function EventsTab({ onRefresh }: EventsTabProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [guests, setGuests] = useState<any[]>([]);
  const [loadingGuests, setLoadingGuests] = useState(false);

  // Form states for Create/Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    venue: "",
    coverImage: "",
    registrationLimit: "",
    status: "published",
  });

  // Fetch events on mount
  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/admin/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      toast.error("Failed to load events list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch guest registrations for selected event
  const handleSelectEvent = async (event: any) => {
    setSelectedEvent(event);
    setLoadingGuests(true);
    try {
      const res = await fetch(`/api/admin/events?eventId=${event.id}`);
      if (!res.ok) throw new Error("Failed to fetch guests");
      const data = await res.json();
      setGuests(data);
    } catch (err) {
      toast.error("Failed to load guest registrations.");
    } finally {
      setLoadingGuests(false);
    }
  };

  // Toggle guest attendance
  const handleToggleAttendance = async (guest: any) => {
    try {
      const res = await fetch("/api/admin/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: guest.id,
          attended: !guest.attended,
        }),
      });

      if (!res.ok) throw new Error("Failed to update attendance");

      toast.success(`Attendance updated for ${guest.name}`);
      
      // Update local state
      setGuests(guests.map(g => g.id === guest.id ? { ...g, attended: !g.attended } : g));
      fetchEvents(); // update metrics on dashboard
    } catch (err) {
      toast.error("Failed to change attendance status.");
    }
  };

  // Remove attendee registration
  const handleDeleteRegistration = async (guestId: number) => {
    if (!confirm("Are you sure you want to remove this registration?")) return;

    try {
      const res = await fetch(`/api/admin/events?registrationId=${guestId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to remove attendee");

      toast.success("Attendee registration removed successfully.");
      setGuests(guests.filter(g => g.id !== guestId));
      fetchEvents();
    } catch (err) {
      toast.error("Failed to remove attendee.");
    }
  };

  // Handle Create or Edit Event Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = editingEvent ? "PUT" : "POST";
      const payload = editingEvent ? { ...form, id: editingEvent.id } : form;

      const res = await fetch("/api/admin/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save event");
      }

      toast.success(editingEvent ? "Event updated successfully!" : "Event created successfully!");
      setModalOpen(false);
      setEditingEvent(null);
      setForm({
        title: "",
        description: "",
        eventDate: "",
        venue: "",
        coverImage: "",
        registrationLimit: "",
        status: "published",
      });
      fetchEvents();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save event");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger editing modal
  const handleStartEdit = (event: any) => {
    setEditingEvent(event);
    
    // Format date string for input datetime-local
    const date = new Date(event.eventDate);
    const dateString = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setForm({
      title: event.title,
      description: event.description,
      eventDate: dateString,
      venue: event.venue,
      coverImage: event.coverImage,
      registrationLimit: event.registrationLimit || "",
      status: event.status,
    });
    setModalOpen(true);
  };

  // Delete event
  const handleDeleteEvent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event? All guest registrations will be deleted.")) return;

    try {
      const res = await fetch(`/api/admin/events?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete event");
      }

      toast.success("Event deleted successfully!");
      if (selectedEvent?.id === id) {
        setSelectedEvent(null);
      }
      fetchEvents();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete event");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-in fade-in duration-200">
      
      {/* Left Columns: Events List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center bg-white p-6 border border-slate-200/80 rounded-2xl shadow-sm">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Trust Campaigns & Events</h3>
            <p className="text-slate-500 text-xs mt-1">Manage schedules, venues, and registration limits</p>
          </div>
          <button
            onClick={() => {
              setEditingEvent(null);
              setForm({
                title: "",
                description: "",
                eventDate: "",
                venue: "",
                coverImage: "",
                registrationLimit: "",
                status: "published",
              });
              setModalOpen(true);
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 bg-white border border-slate-200/80 rounded-2xl">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center text-slate-400">
            No events scheduled. Create one to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => handleSelectEvent(event)}
                className={`bg-white border rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition duration-200 flex flex-col justify-between ${
                  selectedEvent?.id === event.id ? "border-emerald-500 ring-2 ring-emerald-500/10" : "border-slate-200/80"
                }`}
              >
                {/* Event Cover Image */}
                <div className="h-40 bg-slate-100 relative overflow-hidden shrink-0">
                  <img src={event.coverImage} className="w-full h-full object-cover" alt={event.title} />
                  <span className={`absolute top-3 right-3 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    event.status === "published"
                      ? "bg-emerald-500 text-white"
                      : event.status === "completed"
                      ? "bg-slate-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}>
                    {event.status}
                  </span>
                </div>

                {/* Event details */}
                <div className="p-5 flex-1 space-y-4">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base leading-tight truncate">{event.title}</h4>
                    <p className="text-slate-400 text-xs mt-1 truncate">{event.description}</p>
                  </div>

                  <div className="space-y-2 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{new Date(event.eventDate).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        {event.registrationsCount} / {event.registrationLimit || "Unlimited"} Guests Registered
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card controls */}
                <div className="px-5 py-3 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <span className="text-[10px] text-slate-400 font-bold">
                    ID: #{event.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(event);
                      }}
                      className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg shadow-sm hover:shadow transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                      className="p-1.5 bg-white border border-slate-200 text-red-500 hover:text-red-700 rounded-lg shadow-sm hover:shadow transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Registrations viewer */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-6">
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg">Attendee Registry</h3>
          <p className="text-slate-500 text-xs mt-1">
            {selectedEvent ? `Guests registered for: ${selectedEvent.title}` : "Select an event on the left to inspect attendees"}
          </p>
        </div>

        {!selectedEvent ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Please choose a card from the event logs to view registrations.
          </div>
        ) : loadingGuests ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : guests.length === 0 ? (
          <div className="text-center text-slate-400 py-10 text-sm border-2 border-dashed border-slate-100 rounded-xl">
            No registrations received for this event yet.
          </div>
        ) : (
          <div className="space-y-4">
            {guests.map((g) => (
              <div
                key={g.id}
                className="flex justify-between items-start p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition"
              >
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-sm">{g.name}</div>
                  <div className="text-slate-500 text-xs">{g.email}</div>
                  <div className="text-slate-400 text-xs font-semibold">{g.phone}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAttendance(g)}
                    title={g.attended ? "Mark absent" : "Mark attended"}
                    className={`p-1.5 rounded-lg border shadow-sm transition ${
                      g.attended
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                        : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRegistration(g.id)}
                    title="Remove registration"
                    className="p-1.5 bg-slate-50 border border-slate-200 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg shadow-sm transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create/Edit Event */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {editingEvent ? "Edit Event Details" : "Schedule New Event"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                    placeholder="e.g. Free Medical Screening Camp"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm resize-none"
                    placeholder="Describe event details..."
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Venue *</label>
                  <input
                    type="text"
                    required
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                    placeholder="Saravanampatti, Coimbatore"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Cover Image URL *</label>
                  <input
                    type="text"
                    required
                    value={form.coverImage}
                    onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Registration Limit (Optional)</label>
                  <input
                    type="number"
                    value={form.registrationLimit}
                    onChange={(e) => setForm({ ...form, registrationLimit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                    placeholder="e.g. 100"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Publication Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md shadow-emerald-600/10 transition duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving changes...
                  </>
                ) : (
                  editingEvent ? "Save Event Details" : "Create Event"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
