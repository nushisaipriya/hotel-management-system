import React from 'react';
import { X, Database, FileText, RefreshCw, Box, Terminal } from 'lucide-react';

interface OopInspectorModalProps {
  onClose: () => void;
}

export const OopInspectorModal: React.FC<OopInspectorModalProps> = ({ onClose }) => {
  const [dbData, setDbData] = React.useState<any>(null);
  const [activeFile, setActiveFile] = React.useState<string>('data/rooms.json');
  const [activeTab, setActiveTab] = React.useState<'json' | 'classes'>('json');
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchDbContents = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/inspector/db');
      const data = await res.json();
      setDbData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDbContents();
  }, [fetchDbContents]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white border-2 border-slate-900 shadow-2xl overflow-hidden text-slate-900 my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest">Architecture Inspector</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-mono font-bold uppercase">
                  File I/O + OOP Domain
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Object-Oriented Design & Local Storage Engine
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDbContents}
              className="p-2 border border-slate-300 hover:border-slate-900 text-slate-700 transition-colors"
              title="Refresh Data Store"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 border border-slate-300 hover:border-slate-900 text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 border-b border-slate-200 flex items-center gap-4 bg-white text-xs font-mono">
          <button
            onClick={() => setActiveTab('json')}
            className={`pb-3 flex items-center gap-2 font-bold uppercase tracking-wider text-[11px] border-b-2 transition-colors ${
              activeTab === 'json'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            JSON File Store (`/data/*.json`)
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`pb-3 flex items-center gap-2 font-bold uppercase tracking-wider text-[11px] border-b-2 transition-colors ${
              activeTab === 'classes'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Box className="w-4 h-4" />
            OOP Domain Class Entities
          </button>
        </div>

        {/* Body View */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">
          {activeTab === 'json' && (
            <div className="space-y-4">
              {/* File Selector Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
                {['data/rooms.json', 'data/reservations.json', 'data/payments.json', 'data/hotels.json'].map((filePath) => (
                  <button
                    key={filePath}
                    onClick={() => setActiveFile(filePath)}
                    className={`px-3 py-1.5 border text-xs font-bold transition-colors ${
                      activeFile === filePath
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900'
                    }`}
                  >
                    {filePath}
                  </button>
                ))}
              </div>

              {/* Code Viewer */}
              <div className="relative bg-slate-900 text-amber-300 p-4 font-mono text-xs overflow-x-auto max-h-[450px] border border-slate-800">
                {isLoading ? (
                  <div className="py-12 text-center text-slate-400">Reading file from server storage...</div>
                ) : dbData?.files?.[activeFile] ? (
                  <pre className="leading-relaxed whitespace-pre">
                    {JSON.stringify(dbData.files[activeFile], null, 2)}
                  </pre>
                ) : (
                  <div className="text-slate-400">File store empty or initialization pending.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Class 1: Room */}
              <div className="p-4 bg-white border border-slate-200 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-indigo-600 font-bold border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-2">
                    <Box className="w-4 h-4" /> class Room
                  </span>
                  <span className="text-[10px] text-slate-400">Domain Entity</span>
                </div>
                <div className="space-y-1 text-slate-700">
                  <p className="text-slate-400 text-[11px]">// Encapsulates room attributes & rates</p>
                  <p><strong className="text-indigo-600">+ calculatePrice</strong>(nights, discount): PriceBreakdown</p>
                  <p><strong className="text-indigo-600">+ isAvailableForDates</strong>(checkIn, checkOut, res): boolean</p>
                  <p><strong className="text-indigo-600">+ canAccommodate</strong>(guestsCount): boolean</p>
                </div>
              </div>

              {/* Class 2: Reservation */}
              <div className="p-4 bg-white border border-slate-200 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-indigo-600 font-bold border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-2">
                    <Box className="w-4 h-4" /> class Reservation
                  </span>
                  <span className="text-[10px] text-slate-400">Domain Entity</span>
                </div>
                <div className="space-y-1 text-slate-700">
                  <p className="text-slate-400 text-[11px]">// Encapsulates booking details & policy</p>
                  <p><strong className="text-indigo-600">+ generateConfirmationCode</strong>(): string [RES-XXXXXX]</p>
                  <p><strong className="text-indigo-600">+ cancel</strong>(): &#123; refundAmount, policyNotice &#125;</p>
                  <p><strong className="text-indigo-600">+ getNights</strong>(): number</p>
                </div>
              </div>

              {/* Class 3: Payment */}
              <div className="p-4 bg-white border border-slate-200 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-indigo-600 font-bold border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-2">
                    <Box className="w-4 h-4" /> class Payment
                  </span>
                  <span className="text-[10px] text-slate-400">Payment Simulator</span>
                </div>
                <div className="space-y-1 text-slate-700">
                  <p className="text-slate-400 text-[11px]">// Card processing simulation</p>
                  <p><strong className="text-indigo-600">+ process</strong>(cardNumber, exp, cvc): PaymentResult</p>
                </div>
              </div>

              {/* Class 4: FileStorageService */}
              <div className="p-4 bg-white border border-slate-200 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-indigo-600 font-bold border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-2">
                    <Database className="w-4 h-4" /> class FileStorageService
                  </span>
                  <span className="text-[10px] text-slate-400">Repository</span>
                </div>
                <div className="space-y-1 text-slate-700">
                  <p className="text-slate-400 text-[11px]">// Asynchronous atomic JSON read/write</p>
                  <p><strong className="text-indigo-600">+ readData&lt;T&gt;</strong>(fileName, fallback): Promise&lt;T&gt;</p>
                  <p><strong className="text-indigo-600">+ writeData&lt;T&gt;</strong>(fileName, data): Promise&lt;void&gt;</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2 font-mono">
            <Terminal className="w-4 h-4 text-emerald-600" />
            <span>Persistence Engine: Node File System (`fs/promises`)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

