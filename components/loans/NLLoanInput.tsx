'use client';

import { useState, useEffect, useRef } from 'react';
import { parseNaturalLanguageLoan, getSuggestions, type ParsedLoanData } from '@/lib/nlParser';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Sparkles, Check, AlertCircle, ArrowRight, X } from 'lucide-react';

interface NLLoanInputProps {
  onParsed: (data: ParsedLoanData) => void;
  onConfirm: (data: ParsedLoanData) => void;
}

export function NLLoanInput({ onParsed, onConfirm }: NLLoanInputProps) {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<ParsedLoanData | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedInput, setDebouncedInput] = useState('');

  // Debounce input changes
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedInput(input);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [input]);

  // Parse when debounced input changes - setState is intentional here for debounce pattern
  useEffect(() => {
    if (!debouncedInput.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setParsed(null);
      return;
    }

    const result = parseNaturalLanguageLoan(debouncedInput);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParsed(result);
    onParsed(result);
  }, [debouncedInput, onParsed]);

  // Compute isTyping based on whether input differs from debouncedInput
  const isTyping = input !== debouncedInput && input.trim() !== '';

  const handleClear = () => {
    setInput('');
    setParsed(null);
  };

  const handleConfirm = () => {
    if (parsed && parsed.amount) {
      onConfirm(parsed);
    }
  };

  const suggestions = parsed ? getSuggestions(parsed) : [];
  const isValid = parsed && parsed.amount && (parsed.borrowerName || parsed.borrowerEmail);

  const exampleInputs = [
    "lend Channy $50, pay back in 2 weeks",
    "give John $100 monthly for 3 months, no interest",
    "loan sarah@email.com $200, 4 weekly payments, 5% interest",
  ];

  return (
    <div className="space-y-4">
      {/* Main Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Sparkles className="w-5 h-5 text-purple-500" />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type naturally: lend Channy $50, pay back in 2 weeks..."
          className="w-full pl-12 pr-12 py-4 text-lg border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-gradient-to-r from-purple-50 to-blue-50 placeholder:text-gray-400"
        />
        {input && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Example inputs when empty */}
      {!input && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium">Try saying:</p>
          <div className="flex flex-wrap gap-2">
            {exampleInputs.map((example, i) => (
              <button
                key={i}
                onClick={() => setInput(example)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition-colors"
              >
                &quot;{example}&quot;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Parsing indicator */}
      {isTyping && (
        <div className="flex items-center gap-2 text-purple-600 text-sm">
          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span>Understanding your loan...</span>
        </div>
      )}

      {/* Parsed Result */}
      {parsed && !isTyping && (
        <Card className={`border-2 ${isValid ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <CardContent className="p-4">
            {/* Confidence indicator */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isValid ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                <span className={`font-medium ${isValid ? 'text-green-700' : 'text-yellow-700'}`}>
                  {isValid ? 'Ready to create' : 'Missing information'}
                </span>
              </div>
              <Badge variant={parsed.confidence > 0.6 ? 'success' : parsed.confidence > 0.3 ? 'warning' : 'default'}>
                {Math.round(parsed.confidence * 100)}% understood
              </Badge>
            </div>

            {/* Parsed fields */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <ParsedField
                label="Amount"
                value={parsed.amount ? formatCurrency(parsed.amount) : undefined}
                isSet={!!parsed.amount}
              />
              <ParsedField
                label="Borrower"
                value={parsed.borrowerName || parsed.borrowerEmail}
                isSet={!!(parsed.borrowerName || parsed.borrowerEmail)}
              />
              <ParsedField
                label="Schedule"
                value={parsed.installments && parsed.frequency
                  ? `${parsed.installments} ${parsed.frequency} payment${parsed.installments > 1 ? 's' : ''}`
                  : undefined}
                isSet={!!(parsed.installments && parsed.frequency)}
              />
              <ParsedField
                label="Interest"
                value={parsed.interestRate > 0 ? `${parsed.interestRate}%` : 'No interest'}
                isSet={true}
              />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-100 rounded-lg">
                <p className="text-xs font-medium text-yellow-800 mb-1">Add to your description:</p>
                <ul className="text-xs text-yellow-700 space-y-1">
                  {suggestions.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Confirm Button */}
            {isValid && (
              <Button onClick={handleConfirm} className="w-full">
                Create This Loan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper component for displaying parsed fields
function ParsedField({
  label,
  value,
  isSet
}: {
  label: string;
  value: string | undefined;
  isSet: boolean;
}) {
  return (
    <div className={`p-2 rounded-lg ${isSet ? 'bg-white' : 'bg-gray-100 border border-dashed border-gray-300'}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-medium ${isSet ? 'text-gray-900' : 'text-gray-400'}`}>
        {value || 'Not set'}
      </p>
    </div>
  );
}
