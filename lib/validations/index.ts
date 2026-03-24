import { z } from 'zod';

// ===========================================
// Auth Validations
// ===========================================

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ===========================================
// Loan Validations
// ===========================================

export const createLoanSchema = z.object({
  borrowerEmail: z.string().email('Please enter a valid borrower email'),
  principal: z.number().positive('Amount must be greater than 0'),
  interestRate: z.number().min(0, 'Interest rate cannot be negative'),
  installments: z.number().int().min(1, 'At least 1 installment required'),
  frequency: z.enum(['weekly', 'monthly']),
  startDate: z.string().min(1, 'Start date is required'),
  autoDebit: z.boolean(),
  templateId: z.string().optional(),
});

export const quickLendSchema = z.object({
  borrowerEmail: z.string().email('Please enter a valid borrower email'),
  amount: z.number().positive('Amount must be greater than 0'),
  templateId: z.string().optional(),
});

// ===========================================
// Payment Validations
// ===========================================

export const logPaymentSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  note: z.string().optional(),
  scheduleId: z.string().optional(),
});

// ===========================================
// Wallet Validations
// ===========================================

export const topUpSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
});

export const transferSchema = z.object({
  toUserId: z.string().min(1, 'Recipient is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  note: z.string().optional(),
});

// ===========================================
// Template Validations
// ===========================================

export const createTemplateSchema = z.object({
  templateName: z.string().min(1, 'Template name is required'),
  interestRate: z.number().min(0, 'Interest rate cannot be negative'),
  frequency: z.enum(['weekly', 'monthly']),
  installments: z.number().int().min(1, 'At least 1 installment required'),
  autoDebit: z.boolean(),
});

// ===========================================
// AI Validations
// ===========================================

export const parseLoanSchema = z.object({
  text: z.string().min(5, 'Please enter more details about the loan'),
});

export const draftMessageSchema = z.object({
  tone: z.enum(['gentle', 'firm']),
  language: z.enum(['en', 'km', 'both']),
});

// ===========================================
// Profile Validations
// ===========================================

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

// ===========================================
// Export Types
// ===========================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateLoanFormData = z.infer<typeof createLoanSchema>;
export type QuickLendFormData = z.infer<typeof quickLendSchema>;
export type LogPaymentFormData = z.infer<typeof logPaymentSchema>;
export type TopUpFormData = z.infer<typeof topUpSchema>;
export type TransferFormData = z.infer<typeof transferSchema>;
export type CreateTemplateFormData = z.infer<typeof createTemplateSchema>;
export type ParseLoanFormData = z.infer<typeof parseLoanSchema>;
export type DraftMessageFormData = z.infer<typeof draftMessageSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
