import { Injectable, signal } from '@angular/core';
import { PayslipDocument } from '../models/payslip.models';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class PayslipService {
  private readonly payslipData = signal<PayslipDocument | null>(null);
  private readonly validationError = signal<string | null>(null);

  readonly data = this.payslipData.asReadonly();
  readonly error = this.validationError.asReadonly();

  validateAndSetPayslipData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Basic validation: must include payslips and either organization or client info
      if (!parsed.payslips || !Array.isArray(parsed.payslips)) {
        this.validationError.set('Invalid JSON structure. Must include payslips as an array.');
        return false;
      }

      const hasOrganization = !!parsed.organization;
      const hasTopLevelClient = !!parsed.client;
      const hasPerPayslipClient = parsed.payslips.some((p: any) => !!p.client);

      if (!hasOrganization && !hasTopLevelClient && !hasPerPayslipClient) {
        this.validationError.set('Invalid JSON structure. Must include either organization or client information (top-level or per-payslip).');
        return false;
      }

      // Validate organization if present
      if (parsed.organization) {
        if (!parsed.organization.name || !parsed.organization.address) {
          this.validationError.set('Organization must have name and address.');
          return false;
        }
      }

      // Validate top-level client if present and auto-generate missing fields
      if (parsed.client) {
        if (!parsed.client.id) {
          parsed.client.id = `client-${Date.now()}`;
          console.info('Auto-generated client id for top-level client:', parsed.client.id);
        }
        if (!parsed.client.name) {
          parsed.client.name = `Client ${parsed.client.id}`;
          console.info('Auto-generated client name for top-level client:', parsed.client.name);
        }
      }

      // Validate each payslip
      for (const payslip of parsed.payslips) {
        if (!payslip.employee || !payslip.salaryComponents) {
          this.validationError.set('Each payslip must have employee and salaryComponents.');
          return false;
        }

        if (!payslip.employee.id || !payslip.employee.name) {
          this.validationError.set('Employee must have id and name.');
          return false;
        }

        // If payslip includes a client, validate it and auto-generate missing fields
        if (payslip.client) {
          if (!payslip.client.id) {
            payslip.client.id = `client-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            console.info('Auto-generated client id for payslip:', payslip.client.id);
          }
          if (!payslip.client.name) {
            payslip.client.name = `Client ${payslip.client.id}`;
            console.info('Auto-generated client name for payslip:', payslip.client.name);
          }
        }
      }

      this.payslipData.set(parsed);
      this.validationError.set(null);
      return true;
    } catch (error) {
      this.validationError.set('Invalid JSON format: ' + (error as Error).message);
      return false;
    }
  }

  numberToWords(num: number): string {
    if (num === 0) return 'Zero';
    
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Million', 'Billion'];
    
    if (num < 0) return 'Minus ' + this.numberToWords(Math.abs(num));
    
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      const remainder = num % 10;
      return tens[Math.floor(num / 10)] + (remainder === 0 ? '' : ' ' + units[remainder]);
    }
    if (num < 1000) {
      const remainder = num % 100;
      return units[Math.floor(num / 100)] + ' Hundred' + (remainder === 0 ? '' : ' ' + this.numberToWords(remainder));
    }
    
    for (let i = 0; i < thousands.length; i++) {
      const divisor = Math.pow(1000, i + 1);
      if (num < divisor * 1000) {
        const quotient = Math.floor(num / divisor);
        const remainder = num % divisor;
        return this.numberToWords(quotient) + ' ' + thousands[i + 1] + (remainder === 0 ? '' : ' ' + this.numberToWords(remainder));
      }
    }
    
    return num.toString();
  }

  async generatePDF(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found');
      return;
    }

    try {
      // Sanitize element styles to avoid html2canvas parsing unsupported color functions
      // e.g., modern color functions like oklch in gradients can crash html2canvas.
      const sanitizeClass = 'pdf-sanitize-temp';
      const styleId = 'pdf-sanitize-style';

      // Inject sanitizing CSS once (covers pseudo-elements, SVG, masks, borders)
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
.${sanitizeClass}, .${sanitizeClass} *,
.${sanitizeClass}::before, .${sanitizeClass}::after,
.${sanitizeClass} *::before, .${sanitizeClass} *::after {
  background-image: none !important;
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
  filter: none !important;
  -webkit-filter: none !important;
  color: #000 !important;
  border-color: transparent !important;
  border-image: none !important;
  mask-image: none !important;
  -webkit-mask-image: none !important;
  outline: none !important;
}
.${sanitizeClass} svg, .${sanitizeClass} svg * {
  fill: #000 !important;
  stroke: none !important;
  background: transparent !important;
  filter: none !important;
}
`;
        document.head.appendChild(style);
      }

      // Add class to element to sanitize (also add data-attr for extra selector specificity)
      element.classList.add(sanitizeClass);
      element.setAttribute('data-pdf-sanitized', 'true');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      // Remove sanitizing class after capture
      element.classList.remove(sanitizeClass);

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
    } catch (error: any) {
      // Detect unsupported color function errors and provide actionable message
      if (error && /unsupported color function|oklch|color\(/i.test(error.message)) {
        console.error('PDF generation failed due to unsupported CSS color function. Sanitizing styles was applied as a fallback.', error);
      } else {
        console.error('Error generating PDF:', error);
      }
    }
  }

  printPayslip(elementId: string): void {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found');
      return;
    }

    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print Payslip</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            @media print {
              body { margin: 0; padding: 10mm; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
        </html>
      `;
      
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }
}
