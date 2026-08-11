import React from 'react';
import { Search, Calendar, ShieldAlert, AlertCircle, CheckCircle2, XCircle, Printer, MapPin, RefreshCw, Trash2 } from 'lucide-react';
import { ReservationData } from '../types/hotel';

interface MyBookingsProps {
  onCancelSuccess: () => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({ onCancelSuccess }) => {
  const [searchCode, setSearchCode] = React.useState('');
  const [searchEmail, setSearchEmail] = React.useState('');
  const [reservations, setReservations] = React.useState<ReservationData[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [cancellingRes, setCancellingRes] = React.useState<ReservationData | null>(null);
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [cancelPolicyNotice, setCancelPolicyNotice] = React.useState('');

  // Fetch reservations on initial load or search
  const fetchReservations = React.useCallback(async (code = '', email = '') => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams();
      if (code) params.append('code', code);
      if (email) params.append('email', email);

      const res = await fetch(`/api/reservations?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load reservations.');
      const data = await res.json();
      setReservations(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error fetching reservations.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReservations(searchCode, searchEmail);
  };

  const [deletingRes, setDeletingRes] = React.useState<ReservationData | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [actionError, setActionError] = React.useState('');

  const handleConfirmCancel = async () => {
    if (!cancellingRes) return;
    setIsCancelling(true);
    setActionError('');
    try {
      const res = await fetch(`/api/reservations/${cancellingRes.id}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cancellation failed.');

      setCancelPolicyNotice(data.policyNotice || 'Reservation cancelled successfully. The room is now available for booking again!');
      fetchReservations(searchCode, searchEmail);
      onCancelSuccess();
    } catch (err: any) {
      setActionError(err.message || 'Error cancelling reservation.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRes) return;
    setIsDeleting(true);
    setActionError('');
    try {
      const res = await fetch(`/api/reservations/${deletingRes.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove reservation record.');

      setReservations((prev) => prev.filter((r) => r.id !== deletingRes.id && r.confirmationCode !== deletingRes.confirmationCode));
      setDeletingRes(null);
      fetchReservations();
      onCancelSuccess();
    } catch (err: any) {
      setActionError(err.message || 'Error deleting reservation');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-900 space-y-8">
      {/* Header & Search Bar */}
      <div className="bg-white border border-slate-200 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Manage Reservations
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-mono">
              Search by confirmation code or email to review, print vouchers, or process room cancellations.
            </p>
          </div>
          <button
            onClick={() => fetchReservations(searchCode, searchEmail)}
            className="self-start md:self-auto px-4 py-2 border border-slate-300 hover:border-slate-900 text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Search Filter Form */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Confirmation Code
            </label>
            <input
              type="text"
              placeholder="RES-XXXXXX"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full bg-white border border-slate-300 px-3 py-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="md:col-span-5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Guest Email Address
            </label>
            <input
              type="email"
              placeholder="sarah.j@example.com"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full bg-white border border-slate-300 px-3 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-bold py-3 px-4 text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-3.5 h-3.5" />
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-xs font-mono">Querying database store...</p>
        </div>
      )}

      {/* Error State */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMsg && reservations.length === 0 && (
        <div className="py-16 text-center bg-white border border-slate-200 p-8 space-y-3">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Reservations Found</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            No booking matching your search criteria was located in the file store.
          </p>
        </div>
      )}

      {/* Reservations List */}
      {!isLoading && reservations.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Found {reservations.length} Reservation(s)</span>
            <span>Sorted by Recent</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {reservations.map((res) => {
              const isCancelled = res.status === 'Cancelled';
              return (
                <div
                  key={res.id}
                  className={`bg-white border p-6 space-y-6 ${
                    isCancelled ? 'border-slate-200 opacity-75' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {/* Reservation Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-slate-900 font-mono font-bold text-white text-xs">
                        {res.confirmationCode}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        Booked {new Date(res.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border ${
                          isCancelled
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isCancelled ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        {res.status}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Room Thumbnail & Title */}
                    <div className="md:col-span-5 flex items-center gap-4">
                      <img
                        src={res.roomSummary.image}
                        alt={res.roomSummary.name}
                        className="w-16 h-16 object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest block">
                          Room {res.roomSummary.roomNumber} • {res.roomSummary.category}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          {res.roomSummary.name}
                        </h3>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Grand Royale Resort</span>
                        </div>
                      </div>
                    </div>

                    {/* Stay Dates */}
                    <div className="md:col-span-4 grid grid-cols-2 gap-3 text-xs font-mono p-3 bg-slate-50 border border-slate-200">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase block">Check-In</span>
                        <span className="text-slate-900 font-bold block">{res.checkInDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase block">Check-Out</span>
                        <span className="text-slate-900 font-bold block">{res.checkOutDate}</span>
                      </div>
                    </div>

                    {/* Guest & Total */}
                    <div className="md:col-span-3 text-right sm:text-left md:text-right space-y-1">
                      <div className="text-xs text-slate-600">
                        {res.guest.firstName} {res.guest.lastName} ({res.guestsCount} Guest(s))
                      </div>
                      <div className="text-xl font-bold font-mono text-indigo-600">
                        ${res.pricing.grandTotal.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono uppercase">
                        {res.payment.method}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="text-slate-500 font-mono">
                      Guest: <span className="text-slate-900">{res.guest.email}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => window.print()}
                        className="px-4 py-2 border border-slate-300 hover:border-slate-900 text-slate-800 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Voucher
                      </button>

                      {isCancelled ? (
                        <button
                          onClick={() => {
                            setDeletingRes(res);
                            setActionError('');
                          }}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Remove cancelled booking record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove Record
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setCancellingRes(res);
                            setCancelPolicyNotice('');
                          }}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold uppercase tracking-wider text-[10px] transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white border-2 border-slate-900 p-6 space-y-5 text-slate-900 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Confirm Cancellation</h3>
                <span className="text-xs font-mono text-indigo-600">{cancellingRes.confirmationCode}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you wish to cancel the reservation for{' '}
              <strong className="text-slate-900">{cancellingRes.roomSummary.name}</strong> ({cancellingRes.checkInDate} to {cancellingRes.checkOutDate})?
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 space-y-1">
              <div>Total Cost: ${cancellingRes.pricing.grandTotal.toFixed(2)}</div>
              <div className="text-emerald-700 font-bold">Automated JSON Store Inventory Release</div>
            </div>

            {cancelPolicyNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono">
                {cancelPolicyNotice}
              </div>
            )}

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono">
                {actionError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCancellingRes(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider hover:border-slate-900"
              >
                Close
              </button>
              {!cancelPolicyNotice && (
                <button
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="px-5 py-2 bg-rose-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-rose-700 disabled:opacity-50"
                >
                  {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Permanently Remove Record Modal */}
      {deletingRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white border-2 border-slate-900 p-6 space-y-5 text-slate-900 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 text-rose-800 flex items-center justify-center border border-rose-300">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Permanently Remove Record</h3>
                <span className="text-xs font-mono text-slate-500">{deletingRes.confirmationCode}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently remove this cancelled booking record for{' '}
              <strong className="text-slate-900">{deletingRes.roomSummary.name}</strong> from the system history?
            </p>

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono">
                {actionError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingRes(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider hover:border-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-rose-800 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Removing...' : 'Remove Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

