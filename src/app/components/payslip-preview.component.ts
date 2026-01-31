import { Component, input, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { PayslipData, Client, Organization } from '../models/payslip.models';
import { PayslipService } from '../services/payslip.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payslip-preview',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payslip-preview.component.html',
})
export class PayslipPreviewComponent {
  readonly payslipData = input.required<PayslipData | null>();
  // organization is optional now — client-first payloads are supported
  readonly organization = input<Organization | null>();
  readonly client = input<Client | null>();
  readonly elementId = input<string>('payslip-preview');
  
  // Use DI instead of constructing service manually
  private readonly payslipService = inject(PayslipService);

  // Provide a safe default entity to avoid runtime template errors
  readonly displayEntity = computed(() => {
    const c = this.client();
    const o = this.organization();
    return (
      c ?? o ?? {
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: '',
        email: '',
        website: ''
      }
    );
  });

  readonly displayEmail = computed(() => {
    const d = this.displayEntity();
    // Organization has 'email', Client uses 'contact_email'
    if (d && 'email' in d && typeof (d as Organization).email === 'string') return (d as Organization).email;
    if (d && 'contact_email' in d && typeof (d as Client).contact_email === 'string') return (d as Client).contact_email;
    return '';
  });

  readonly earnings = computed(() => {
    const data = this.payslipData();
    return data?.salaryComponents.filter(c => c.type === 'earning') || [];
  });

  readonly deductions = computed(() => {
    const data = this.payslipData();
    return data?.salaryComponents.filter(c => c.type === 'deduction') || [];
  });

  readonly totalEarnings = computed(() => {
    return this.earnings().reduce((sum, c) => sum + c.amount, 0);
  });

  readonly totalDeductions = computed(() => {
    return this.deductions().reduce((sum, c) => sum + c.amount, 0);
  });

  readonly netPay = computed(() => {
    return this.totalEarnings() - this.totalDeductions();
  });

  readonly netPayInWords = computed(() => {
    return this.payslipService.numberToWords(Math.floor(this.netPay()));
  });

  downloadPdf(): void {
    const data = this.payslipData();
    if (data) {
      const filename = `payslip_${data.employee.id}_${data.month}_${data.year}.pdf`;
      void this.payslipService.generatePDF(this.elementId(), filename);
    }
  }

  print(): void {
    // synchronous
    this.payslipService.printPayslip(this.elementId());
  }
}
