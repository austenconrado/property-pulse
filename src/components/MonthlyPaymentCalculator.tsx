import { useState, useEffect } from 'react';
import { DollarSign, Edit2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { MonthlyPayment } from '@/types/property';

interface MonthlyPaymentCalculatorProps {
  purchasePrice: number;
  downPayment: number;
  interestRate?: number;
  initialPropertyTaxRate?: number;
  initialUtilities?: number;
  onPaymentChange: (payment: MonthlyPayment) => void;
}

interface PaymentLineItem {
  key: keyof Omit<MonthlyPayment, 'total'>;
  label: string;
  defaultValue: number;
  isEditable: boolean;
}

export function MonthlyPaymentCalculator({
  purchasePrice,
  downPayment,
  interestRate = 7.0,
  initialPropertyTaxRate,
  initialUtilities,
  onPaymentChange,
}: MonthlyPaymentCalculatorProps) {
  const loanAmount = purchasePrice - downPayment;
  const downPaymentPercent = (downPayment / purchasePrice) * 100;
  
  // Use provided tax rate or default based on national average
  const effectiveTaxRate = initialPropertyTaxRate ?? 0.012;

  // Calculate default P&I based on loan amount and interest rate
  const calculatePandI = () => {
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = 30 * 12; // 30-year fixed
    if (monthlyRate === 0) return loanAmount / numPayments;
    return (
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    );
  };

  const defaultPayments: PaymentLineItem[] = [
    { key: 'principalAndInterest', label: 'Principal & Interest', defaultValue: calculatePandI(), isEditable: true },
    { key: 'mortgageInsurance', label: 'PMI', defaultValue: downPaymentPercent < 20 ? loanAmount * 0.005 / 12 : 0, isEditable: true },
    { key: 'propertyTaxes', label: 'Property Taxes', defaultValue: purchasePrice * effectiveTaxRate / 12, isEditable: true },
    { key: 'homeownersInsurance', label: 'Homeowners Insurance', defaultValue: purchasePrice * 0.003 / 12, isEditable: true },
    { key: 'hoaFees', label: 'HOA Fees', defaultValue: 0, isEditable: true },
    { key: 'utilities', label: 'Utilities', defaultValue: initialUtilities ?? 200, isEditable: true },
  ];

  const [payments, setPayments] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    defaultPayments.forEach(item => {
      initial[item.key] = item.defaultValue;
    });
    return initial;
  });

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    const total = Object.values(payments).reduce((sum, val) => sum + val, 0);
    const fullPayment: MonthlyPayment = {
      principalAndInterest: payments.principalAndInterest,
      mortgageInsurance: payments.mortgageInsurance,
      propertyTaxes: payments.propertyTaxes,
      homeownersInsurance: payments.homeownersInsurance,
      hoaFees: payments.hoaFees,
      utilities: payments.utilities,
      total,
    };
    onPaymentChange(fullPayment);
  }, [payments, onPaymentChange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleEdit = (key: string, currentValue: number) => {
    setEditingKey(key);
    setEditValue(currentValue.toFixed(0));
  };

  const handleSave = () => {
    if (editingKey) {
      setPayments(prev => ({
        ...prev,
        [editingKey]: parseFloat(editValue) || 0,
      }));
      setEditingKey(null);
    }
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const total = Object.values(payments).reduce((sum, val) => sum + val, 0);

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Monthly Payment Breakdown</h3>
      </div>

      <div className="space-y-3">
        {defaultPayments.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
          >
            <span className="text-sm text-muted-foreground">{item.label}</span>
            
            {editingKey === item.key ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-24 h-8 pl-5 text-right text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                      if (e.key === 'Escape') handleCancel();
                    }}
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="p-1 text-success hover:bg-success/20 rounded"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1 text-danger hover:bg-danger/20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(payments[item.key])}
                </span>
                {item.isEditable && (
                  <button
                    onClick={() => handleEdit(item.key, payments[item.key])}
                    className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">Total Monthly Payment</span>
          <span className="text-2xl font-bold text-gradient">{formatCurrency(total)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {((total / (purchasePrice / 12)) * 100).toFixed(1)}% of property value annually
        </p>
      </div>
    </div>
  );
}
