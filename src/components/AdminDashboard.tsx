import React from 'react';
import { ShieldCheck, DollarSign, BedDouble, TrendingUp, Plus, AlertTriangle, Layers, RefreshCw, Trash2, Edit } from 'lucide-react';
import { RoomData, RoomCategory } from '../types/hotel';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = React.useState<any>(null);
  const [rooms, setRooms] = React.useState<RoomData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // New/Edit Room Modal
  const [showRoomModal, setShowRoomModal] = React.useState(false);
  const [editingRoom, setEditingRoom] = React.useState<Partial<RoomData>>({
    category: 'Standard',
    status: 'Available',
    pricePerNight: 199,
    maxGuests: 2,
    sizeSqFt: 400,
  });

  const fetchAdminData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      const roomsRes = await fetch('/api/rooms');
      const roomsData = await roomsRes.json();
      setRooms(roomsData);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRoom),
      });
      if (!res.ok) throw new Error('Failed to save room.');
      setShowRoomModal(false);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const [deletingRoomId, setDeletingRoomId] = React.useState<string | null>(null);
  const [adminError, setAdminError] = React.useState<string>('');

  const handleConfirmDeleteRoom = async () => {
    if (!deletingRoomId) return;
    setAdminError('');
    try {
      const res = await fetch(`/api/admin/rooms/${deletingRoomId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete room.');
      setDeletingRoomId(null);
      fetchAdminData();
    } catch (err: any) {
      setAdminError(err.message || 'Error deleting room');
    }
  };

  const handleToggleStatus = async (room: RoomData) => {
    const nextStatus = room.status === 'Available' ? 'Maintenance' : 'Available';
    try {
      await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...room, status: nextStatus }),
      });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-900 space-y-3">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 font-mono text-xs">Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-900 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Management Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Hotel Operations Analytics
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            className="p-2.5 border border-slate-300 hover:border-slate-900 text-slate-700 transition-colors"
            title="Refresh Stats"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingRoom({ category: 'Standard', status: 'Available', pricePerNight: 199, maxGuests: 2, sizeSqFt: 400 });
              setShowRoomModal(true);
            }}
            className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-800 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase tracking-widest font-bold">
              <span>Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-mono text-2xl font-bold text-slate-900">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              From {stats.activeReservationsCount} bookings
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase tracking-widest font-bold">
              <span>Occupancy</span>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="font-mono text-2xl font-bold text-indigo-600">
              {stats.occupancyRate}%
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {stats.activeReservationsCount} of {stats.totalRooms} rooms reserved
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase tracking-widest font-bold">
              <span>Total Nights</span>
              <BedDouble className="w-4 h-4 text-slate-700" />
            </div>
            <div className="font-mono text-2xl font-bold text-slate-900">
              {stats.totalNightsBooked}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Cumulative stay duration
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase tracking-widest font-bold">
              <span>Cancellations</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="font-mono text-2xl font-bold text-rose-600">
              {stats.cancelledReservationsCount}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Processed cancellations
            </div>
          </div>
        </div>
      )}

      {/* Room Inventory Table */}
      <div className="bg-white border border-slate-200 p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          Room Inventory & Maintenance Controls
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase tracking-widest border-b border-slate-200">
              <tr>
                <th className="p-3">Room</th>
                <th className="p-3">Category</th>
                <th className="p-3">Name</th>
                <th className="p-3">Price / Night</th>
                <th className="p-3">Capacity</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900">Room {room.roomNumber}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                      {room.category}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900">{room.name}</td>
                  <td className="p-3 font-mono font-bold text-indigo-600">${room.pricePerNight}</td>
                  <td className="p-3 font-mono">{room.maxGuests} Guests</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${
                        room.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {room.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingRoom(room);
                        setShowRoomModal(true);
                      }}
                      className="px-2.5 py-1 border border-slate-300 hover:border-slate-900 text-slate-800 text-[10px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                      title="Edit Room"
                    >
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(room)}
                      className="px-2.5 py-1 border border-slate-300 hover:border-slate-900 text-slate-800 text-[10px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                    >
                      Set {room.status === 'Available' ? 'Maintenance' : 'Available'}
                    </button>
                    <button
                      onClick={() => {
                        setDeletingRoomId(room.id);
                        setAdminError('');
                      }}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1 cursor-pointer"
                      title="Remove Room"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white border-2 border-slate-900 p-6 space-y-5 text-slate-900 shadow-2xl">
            <h3 className="text-lg font-bold">Add Room to Inventory</h3>

            <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Executive Ocean Villa"
                  value={editingRoom.name || ''}
                  onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 601"
                    value={editingRoom.roomNumber || ''}
                    onChange={(e) => setEditingRoom({ ...editingRoom, roomNumber: e.target.value })}
                    className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Category
                  </label>
                  <select
                    value={editingRoom.category || 'Standard'}
                    onChange={(e) => setEditingRoom({ ...editingRoom, category: e.target.value as RoomCategory })}
                    className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Executive">Executive</option>
                    <option value="Penthouse">Penthouse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Price / Night ($)
                  </label>
                  <input
                    type="number"
                    required
                    min={50}
                    value={editingRoom.pricePerNight || 199}
                    onChange={(e) => setEditingRoom({ ...editingRoom, pricePerNight: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Max Guests
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10}
                    value={editingRoom.maxGuests || 2}
                    onChange={(e) => setEditingRoom({ ...editingRoom, maxGuests: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Luxury room features..."
                  value={editingRoom.description || ''}
                  onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
                  className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider hover:border-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800"
                >
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Room Confirmation Modal */}
      {deletingRoomId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white border-2 border-slate-900 p-6 space-y-5 text-slate-900 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 text-rose-800 flex items-center justify-center border border-rose-300">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Confirm Room Deletion</h3>
                <span className="text-xs font-mono text-slate-500">ID: {deletingRoomId}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete/remove this room from the resort inventory? This action will update the persistent room records.
            </p>

            {adminError && (
              <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono">
                {adminError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRoomId(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider hover:border-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteRoom}
                className="px-5 py-2 bg-rose-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-rose-800 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

