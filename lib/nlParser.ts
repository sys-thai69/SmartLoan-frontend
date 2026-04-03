// Natural Language Loan Parser
// This parses user input like "lend Channy $20, pay back in 2 weeks, no interest"
// into structured loan fields

export interface ParsedLoanData {
  borrowerName?: string;
  borrowerEmail?: string;
  borrowerPhone?: string;
  amount?: number;
  currency: string;
  installments?: number;
  frequency?: 'weekly' | 'monthly';
  interestRate: number;
  duration?: string;
  confidence: number; // 0-1 score indicating parse confidence
  rawInput: string;
}

export interface ParsedField {
  value: string | number | undefined;
  matched: boolean;
  suggestion?: string;
}

// Common patterns for parsing loan descriptions
const AMOUNT_PATTERNS = [
  /\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,                    // $20, $1,000.00
  /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars?|usd|bucks?)/i, // 20 dollars, 100 USD
  /(?:lend|loan|give|send)\s+(?:\w+\s+)?\$?(\d+(?:\.\d{2})?)/i, // lend Channy $20
];

const NAME_PATTERNS = [
  /(?:lend|loan|give|send)\s+(?:to\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i, // lend Channy, lend to John
  /(?:to|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,        // to Channy, for John
  /([A-Z][a-z]+)\s+(?:owes?|needs?|wants?|borrows?)/i,     // Channy needs
];

const EMAIL_PATTERNS = [
  /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,     // email@example.com
];

const PHONE_PATTERNS = [
  /\+(\d{1,3})\s?(\d{3,14})/,                                // +855912345678
  /\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})/,             // (123) 456-7890
];

const DURATION_PATTERNS = [
  /(?:in|within|after)\s+(\d+)\s*(weeks?|months?|days?)/i,  // in 2 weeks
  /(\d+)\s*(weeks?|months?|days?)\s*(?:later|from now)?/i,  // 2 weeks later
  /(?:pay\s*back|repay|return)\s+(?:in\s+)?(\d+)\s*(weeks?|months?|days?)/i, // pay back in 2 weeks
  /(?:due|by)\s+(\d+)\s*(weeks?|months?|days?)/i,          // due in 2 weeks
];

const INSTALLMENT_PATTERNS = [
  /(\d+)\s*(?:payments?|installments?|times?)/i,           // 4 payments
  /(?:split|divide)\s+(?:into\s+)?(\d+)/i,                 // split into 4
  /(?:pay|repay)\s+(\d+)\s*(?:times?)/i,                   // pay 4 times
];

const INTEREST_PATTERNS = [
  /(\d+(?:\.\d+)?)\s*%?\s*(?:interest|rate)/i,            // 5% interest
  /(?:interest|rate)\s*(?:of\s+)?(\d+(?:\.\d+)?)\s*%?/i,  // interest of 5%
  /(?:no|zero|0%?)\s*interest/i,                           // no interest
  /interest[\s-]*free/i,                                    // interest-free
];

const FREQUENCY_PATTERNS = [
  /(?:pay|repay)\s*(?:back\s+)?(?:every\s+)?(week|month)ly?/i, // pay weekly
  /(weekly|monthly)\s*(?:payments?|installments?)?/i,          // monthly payments
  /(?:per|each|every)\s*(week|month)/i,                        // per week
];

export function parseNaturalLanguageLoan(input: string): ParsedLoanData {
  const trimmedInput = input.trim();
  let confidence = 0;
  let matchedFields = 0;
  const totalFields = 5; // amount, borrower, duration, interest, frequency

  // Parse amount
  let amount: number | undefined;
  for (const pattern of AMOUNT_PATTERNS) {
    const match = trimmedInput.match(pattern);
    if (match) {
      amount = parseFloat(match[1].replace(/,/g, ''));
      matchedFields++;
      break;
    }
  }

  // Parse borrower name
  let borrowerName: string | undefined;
  for (const pattern of NAME_PATTERNS) {
    const match = trimmedInput.match(pattern);
    if (match && match[1]) {
      // Filter out common words that aren't names
      const name = match[1].trim();
      const commonWords = ['me', 'her', 'him', 'them', 'back', 'money', 'loan', 'cash'];
      if (!commonWords.includes(name.toLowerCase())) {
        borrowerName = name;
        matchedFields++;
        break;
      }
    }
  }

  // Parse email
  let borrowerEmail: string | undefined;
  const emailMatch = trimmedInput.match(EMAIL_PATTERNS[0]);
  if (emailMatch) {
    borrowerEmail = emailMatch[1];
    if (!borrowerName) matchedFields++; // Count as borrower field if no name
  }

  // Parse phone number
  let borrowerPhone: string | undefined;
  for (const pattern of PHONE_PATTERNS) {
    const match = trimmedInput.match(pattern);
    if (match) {
      // Extract digits only
      borrowerPhone = match[0].replace(/\D/g, '');
      if (!borrowerName && !borrowerEmail) matchedFields++; // Count as borrower field
      break;
    }
  }

  // Parse duration and convert to installments/frequency
  let installments: number | undefined;
  let frequency: 'weekly' | 'monthly' | undefined;
  let duration: string | undefined;

  for (const pattern of DURATION_PATTERNS) {
    const match = trimmedInput.match(pattern);
    if (match) {
      const num = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      duration = `${num} ${unit}`;

      if (unit.startsWith('week')) {
        frequency = 'weekly';
        installments = num;
      } else if (unit.startsWith('month')) {
        frequency = 'monthly';
        installments = num;
      } else if (unit.startsWith('day')) {
        // Convert days to weeks if >= 7
        if (num >= 7) {
          frequency = 'weekly';
          installments = Math.ceil(num / 7);
        } else {
          frequency = 'weekly';
          installments = 1;
        }
      }
      matchedFields++;
      break;
    }
  }

  // Parse explicit installments (overrides duration-based calculation)
  for (const pattern of INSTALLMENT_PATTERNS) {
    const match = trimmedInput.match(pattern);
    if (match) {
      installments = parseInt(match[1]);
      break;
    }
  }

  // Parse frequency if not set by duration
  if (!frequency) {
    for (const pattern of FREQUENCY_PATTERNS) {
      const match = trimmedInput.match(pattern);
      if (match) {
        const unit = match[1].toLowerCase();
        frequency = unit.startsWith('week') ? 'weekly' : 'monthly';
        matchedFields++;
        break;
      }
    }
  }

  // Parse interest rate
  let interestRate = 0;
  const noInterestMatch = trimmedInput.match(/(?:no|zero|0%?)\s*interest|interest[\s-]*free/i);
  if (noInterestMatch) {
    interestRate = 0;
    matchedFields++;
  } else {
    for (const pattern of INTEREST_PATTERNS) {
      const match = trimmedInput.match(pattern);
      if (match && match[1]) {
        interestRate = parseFloat(match[1]);
        matchedFields++;
        break;
      }
    }
  }

  // Calculate confidence score
  confidence = matchedFields / totalFields;

  // Boost confidence if we have the essential fields (amount + borrower)
  if (amount && (borrowerName || borrowerEmail || borrowerPhone)) {
    confidence = Math.min(1, confidence + 0.2);
  }

  // Set defaults for missing fields
  if (!frequency) frequency = 'monthly';
  if (!installments) installments = 1;

  return {
    borrowerName,
    borrowerEmail,
    borrowerPhone,
    amount,
    currency: 'USD',
    installments,
    frequency,
    interestRate,
    duration,
    confidence,
    rawInput: trimmedInput,
  };
}

// Helper to format parsed data for display
export function formatParsedLoan(parsed: ParsedLoanData): string {
  const parts: string[] = [];

  if (parsed.amount) {
    parts.push(`$${parsed.amount.toFixed(2)}`);
  }

  if (parsed.borrowerName || parsed.borrowerEmail || parsed.borrowerPhone) {
    parts.push(`to ${parsed.borrowerName || parsed.borrowerEmail || parsed.borrowerPhone}`);
  }

  if (parsed.installments && parsed.frequency) {
    parts.push(`${parsed.installments} ${parsed.frequency} payment${parsed.installments > 1 ? 's' : ''}`);
  }

  parts.push(parsed.interestRate > 0 ? `${parsed.interestRate}% interest` : 'no interest');

  return parts.join(' • ');
}

// Suggest improvements or missing fields
export function getSuggestions(parsed: ParsedLoanData): string[] {
  const suggestions: string[] = [];

  if (!parsed.amount) {
    suggestions.push('Add an amount (e.g., "$50" or "50 dollars")');
  }

  if (!parsed.borrowerName && !parsed.borrowerEmail && !parsed.borrowerPhone) {
    suggestions.push('Add borrower name, email, or phone (e.g., "to Channy", "channy@email.com", or "+855912345678")');
  }

  if (!parsed.duration) {
    suggestions.push('Add duration (e.g., "in 2 weeks" or "pay back in 1 month")');
  }

  return suggestions;
}
