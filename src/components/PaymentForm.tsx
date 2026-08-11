import React from 'react';
import { CreditCard, Wallet, Building2, Lock, AlertCircle } from 'lucide-react';
import { PaymentMethod } from '../types/hotel';

interface PaymentFormProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  cardDetails: {
    number: string;
    exp: string;
    cvc: string;
    name: string;
  };
  setCardDetails: React.Dispatch<React.SetStateAction<{
    number: string;
    exp: string;
    cvc: string;
    name: string;
  }>>;
  amount: number;
  isProcessing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  errorMessage?: string;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentMethod,
  setPaymentMethod,
  cardDetails,
  setCardDetails,
  amount,
  isProcessing,
  onSubmit,
  errorMessage,
}) => {
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    val = val.substring(0, 16);
    const formatted = val.replace(/(\d{4})/g, '$1 ').trim();
    setCardDetails((prev) => ({ ...prev, number: formatted }));
  };

  const handleExpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    val = val.substring(0, 4);
    if (val.length >= 2) {
      val = `${val.substring(0, 2)}/${val.substring(2)}`;
    }
    setCardDetails((prev) => ({ ...prev, exp: val }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Payment Method Selector */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setPaymentMethod('CreditCard')}
          className={`p-3 border flex flex-col items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
            paymentMethod === 'CreditCard'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Card</span>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod('DigitalWallet')}
          className={`p-3 border flex flex-col items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
            paymentMethod === 'DigitalWallet'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Express Pay</span>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod('PayAtHotel')}
          className={`p-3 border flex flex-col items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
            paymentMethod === 'PayAtHotel'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Pay at Hotel</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Credit Card Inputs */}
      {paymentMethod === 'CreditCard' && (
        <div className="space-y-3 p-4 bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-wider">Credit / Debit Card Simulation</span>
            <button
              type="button"
              onClick={() => {
                setCardDetails({
                  name: 'Sarah Jenkins',
                  number: '4242 4242 4242 4242',
                  exp: '12/28',
                  cvc: '123',
                });
              }}
              className="text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 underline cursor-pointer"
            >
              Auto-Fill Test Card
            </button>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Jenkins"
              value={cardDetails.name}
              onChange={(e) => setCardDetails((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              Card Number (Simulated)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="4242 4242 4242 4242"
                value={cardDetails.number}
                onChange={handleCardNumberChange}
                className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900 pr-10"
              />
              <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Expiration (MM/YY)
              </label>
              <input
                type="text"
                required
                placeholder="12/28"
                value={cardDetails.exp}
                onChange={handleExpChange}
                className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                CVC / CVV
              </label>
              <input
                type="password"
                required
                maxLength={4}
                placeholder="123"
                value={cardDetails.cvc}
                onChange={(e) => setCardDetails((prev) => ({ ...prev, cvc: e.target.value.replace(/\D/g, '') }))}
                className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {paymentMethod === 'DigitalWallet' && (
        <div className="p-4 bg-slate-50 border border-slate-200 text-center space-y-2">
          <Wallet className="w-6 h-6 text-indigo-600 mx-auto" />
          <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Simulated Express Checkout</p>
          <p className="text-xs text-slate-500">
            Clicking "Confirm Reservation" simulates express authentication and authorizes ${amount.toFixed(2)}.
          </p>
        </div>
      )}

      {paymentMethod === 'PayAtHotel' && (
        <div className="p-4 bg-slate-50 border border-slate-200 text-center space-y-2">
          <Building2 className="w-6 h-6 text-indigo-600 mx-auto" />
          <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Pay Upon Check-In</p>
          <p className="text-xs text-slate-500">
            No charge right now. Your booking is guaranteed, and payment of ${amount.toFixed(2)} will be settled at arrival.
          </p>
        </div>
      )}

      <div className="pt-2 space-y-3">
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-slate-900 text-white py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing Transaction...</span>
            </>
          ) : (
            <span>Confirm Reservation (${amount.toFixed(2)})</span>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400 uppercase tracking-widest font-mono">
          <Lock className="w-3 h-3 text-emerald-600" />
          <span>256-Bit SSL Encrypted Payment Simulation</span>
        </div>
      </div>
    </form>
  );
};

