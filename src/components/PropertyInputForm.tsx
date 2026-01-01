import { useState } from 'react';
import { Building2, DollarSign, MapPin, Home, Bed, Bath, Percent, Link } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PropertyInput } from '@/types/property';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

const PROPERTY_TYPES = [
  'Single-family',
  'Condo',
  'Multi-family',
  'Townhome',
  'Duplex',
  'Triplex',
  'Fourplex'
];

const BEDROOMS = ['1', '2', '3', '4', '5', '6+'];
const BATHROOMS = ['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5+'];

interface PropertyInputFormProps {
  onSubmit: (data: PropertyInput) => void;
  isLoading: boolean;
}

export function PropertyInputForm({ onSubmit, isLoading }: PropertyInputFormProps) {
  const [formData, setFormData] = useState<Partial<PropertyInput>>({
    downPaymentPercentage: 20,
  });
  const [downPaymentMode, setDownPaymentMode] = useState<'percentage' | 'amount'>('percentage');

  const handleChange = (field: keyof PropertyInput, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate down payment
      if (field === 'purchasePrice' && prev.downPaymentPercentage) {
        updated.downPaymentAmount = (Number(value) * prev.downPaymentPercentage) / 100;
      }
      if (field === 'downPaymentPercentage' && prev.purchasePrice) {
        updated.downPaymentAmount = (prev.purchasePrice * Number(value)) / 100;
      }
      if (field === 'downPaymentAmount' && prev.purchasePrice) {
        updated.downPaymentPercentage = (Number(value) / prev.purchasePrice) * 100;
      }
      
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      onSubmit(formData as PropertyInput);
    }
  };

  const isFormValid = () => {
    return (
      formData.state &&
      formData.listingUrl &&
      formData.purchasePrice &&
      formData.yearlyIncome &&
      formData.propertyType &&
      formData.bedrooms &&
      formData.bathrooms &&
      (formData.downPaymentAmount || formData.downPaymentPercentage)
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* State & Listing URL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            State
          </Label>
          <Select
            value={formData.state}
            onValueChange={(value) => handleChange('state', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link className="w-4 h-4" />
            Listing URL
          </Label>
          <Input
            type="url"
            placeholder="https://zillow.com/..."
            value={formData.listingUrl || ''}
            onChange={(e) => handleChange('listingUrl', e.target.value)}
          />
        </div>
      </div>

      {/* Property Type */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="w-4 h-4" />
          Property Type
        </Label>
        <Select
          value={formData.propertyType}
          onValueChange={(value) => handleChange('propertyType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select property type" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bedrooms & Bathrooms */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bed className="w-4 h-4" />
            Bedrooms
          </Label>
          <Select
            value={formData.bedrooms?.toString()}
            onValueChange={(value) => handleChange('bedrooms', parseFloat(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Beds" />
            </SelectTrigger>
            <SelectContent>
              {BEDROOMS.map((num) => (
                <SelectItem key={num} value={num}>
                  {num} {num === '1' ? 'Bedroom' : 'Bedrooms'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bath className="w-4 h-4" />
            Bathrooms
          </Label>
          <Select
            value={formData.bathrooms?.toString()}
            onValueChange={(value) => handleChange('bathrooms', parseFloat(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Baths" />
            </SelectTrigger>
            <SelectContent>
              {BATHROOMS.map((num) => (
                <SelectItem key={num} value={num}>
                  {num} {num === '1' ? 'Bathroom' : 'Bathrooms'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Financial Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="w-4 h-4" />
            Purchase Price
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              type="number"
              className="pl-7"
              placeholder="500,000"
              value={formData.purchasePrice || ''}
              onChange={(e) => handleChange('purchasePrice', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            Yearly Income
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              type="number"
              className="pl-7"
              placeholder="120,000"
              value={formData.yearlyIncome || ''}
              onChange={(e) => handleChange('yearlyIncome', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      {/* Down Payment */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Percent className="w-4 h-4" />
            Down Payment
          </Label>
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            <button
              type="button"
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                downPaymentMode === 'percentage' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setDownPaymentMode('percentage')}
            >
              %
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                downPaymentMode === 'amount' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setDownPaymentMode('amount')}
            >
              $
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <Input
              type="number"
              placeholder={downPaymentMode === 'percentage' ? '20' : '100,000'}
              value={
                downPaymentMode === 'percentage'
                  ? formData.downPaymentPercentage || ''
                  : formData.downPaymentAmount || ''
              }
              onChange={(e) =>
                handleChange(
                  downPaymentMode === 'percentage' ? 'downPaymentPercentage' : 'downPaymentAmount',
                  parseFloat(e.target.value) || 0
                )
              }
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {downPaymentMode === 'percentage' ? '%' : ''}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground bg-secondary/30 rounded-lg px-4">
            {formData.purchasePrice && formData.downPaymentPercentage ? (
              <span>
                {formatCurrency(formData.downPaymentAmount || 0)} ({formData.downPaymentPercentage?.toFixed(1)}%)
              </span>
            ) : (
              <span className="text-muted-foreground/50">Enter price first</span>
            )}
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        variant="gradient" 
        size="lg" 
        className="w-full"
        disabled={!isFormValid() || isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Analyzing Property...
          </span>
        ) : (
          'Analyze Investment'
        )}
      </Button>
    </form>
  );
}
