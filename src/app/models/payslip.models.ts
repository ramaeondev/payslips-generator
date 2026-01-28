export interface Organization {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
}

export interface Employee {
  id: string;
  name: string;
  designation: string;
  department: string;
  joiningDate: string;
  bankAccount?: string;
  panNumber?: string;
}

export interface SalaryComponent {
  name: string;
  amount: number;
  type: 'earning' | 'deduction';
}

export interface Client {
  id: string;
  name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  logo?: string;
  header?: string;
  footer?: string;
  signature?: string;
  metadata?: Record<string, string>;
}

export interface PayslipData {
  payslipNumber: string;
  month: string;
  year: number;
  payPeriod: {
    from: string;
    to: string;
  };
  employee: Employee;
  salaryComponents: SalaryComponent[];
  netPay: number;
  currency: string;
  currencySymbol: string;
  client?: Client;
}

export interface PayslipDocument {
  organization?: Organization;
  client?: Client;
  payslips: PayslipData[];
}

export interface PayslipTemplate {
  id: string;
  name: string;
  description: string;
}
