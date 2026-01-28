# 📄 Payslip Generator

A modern, feature-rich Angular application for generating professional payslips. Built with Angular 21, this application provides a JSON-based interface for creating, previewing, and downloading employee payslips in PDF format.

![Angular](https://img.shields.io/badge/Angular-21.1.0-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.12-38bdf8)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **📝 JSON-Based Input**: Enter payslip data in JSON format with real-time validation
- **👁️ Live Preview**: See payslips rendered instantly as you type
- **📥 PDF Generation**: Download payslips as professional PDF documents
- **🖨️ Print Support**: Direct printing functionality for physical copies
- **💰 Automatic Calculations**: Net pay calculated automatically from earnings and deductions
- **🔢 Number to Words**: Net pay displayed in both numeric and word format
- **🏢 Organization Branding**: Customizable company logo, name, and contact details
- **👥 Multiple Employees**: Generate payslips for multiple employees in one go
- **📅 Multi-Period Support**: Create payslips for different months/periods
- **💱 Currency Support**: Configurable currency symbols and formats
- **➕ Dynamic Components**: Add unlimited salary components (earnings/deductions)
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **♿ Accessible**: WCAG AA compliant with proper ARIA attributes
- **🎨 Beautiful UI**: Modern design with Tailwind CSS
- **⚡ Performance**: Built with signals and OnPush change detection

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/payslips-generator.git
cd payslips-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:4200/`

## 📖 Usage

### Basic Workflow

1. **Load Sample Data**: Click "Load Sample" to see example JSON structure
2. **Edit JSON**: Modify the JSON on the left panel to match your data
3. **Preview**: See the formatted payslip instantly on the right panel
4. **Download/Print**: Use the action buttons to save or print the payslip

### JSON Structure

The application expects a JSON object with the following structure:

```json
{
  "organization": {
    "name": "Company Name",
    "address": "Street Address",
    "city": "City",
    "state": "State",
    "zipCode": "123456",
    "country": "Country",
    "phone": "+1-234-567-8900",
    "email": "hr@company.com",
    "website": "www.company.com",
    "logo": "data:image/svg+xml,..."
  },
  "payslips": [
    {
      "payslipNumber": "PAY-2026-001-001",
      "month": "January",
      "year": 2026,
      "payPeriod": {
        "from": "2026-01-01",
        "to": "2026-01-31"
      },
      "employee": {
        "id": "EMP001",
        "name": "John Doe",
        "designation": "Software Engineer",
        "department": "Engineering",
        "joiningDate": "2022-01-15",
        "bankAccount": "BANK-XXXXXXXXX1234",
        "panNumber": "ABCDE1234F"
      },
      "salaryComponents": [
        {
          "name": "Basic Salary",
          "amount": 50000,
          "type": "earning"
        },
        {
          "name": "Provident Fund (PF)",
          "amount": 6000,
          "type": "deduction"
        }
      ],
      "netPay": 44000,
      "currency": "USD",
      "currencySymbol": "$"
    }
  ]
}
```

### Field Descriptions

#### Organization Fields
- `name` **(required)**: Company/organization name
- `address` **(required)**: Street address
- `city`, `state`, `zipCode`, `country`: Location details
- `phone`, `email`: Contact information
- `website` *(optional)*: Company website
- `logo` *(optional)*: Base64 encoded image or SVG data URI

#### Employee Fields
- `id` **(required)**: Unique employee identifier
- `name` **(required)**: Employee full name
- `designation` **(required)**: Job title
- `department` **(required)**: Department name
- `joiningDate` **(required)**: Date of joining (YYYY-MM-DD)
- `bankAccount` *(optional)*: Bank account details
- `panNumber` *(optional)*: Tax identification number

#### Salary Component Fields
- `name` **(required)**: Component name (e.g., "Basic Salary", "HRA")
- `amount` **(required)**: Numeric value
- `type` **(required)**: Either "earning" or "deduction"

#### Payslip Fields
- `payslipNumber` **(required)**: Unique payslip identifier
- `month` **(required)**: Month name
- `year` **(required)**: Year (numeric)
- `payPeriod` **(required)**: Object with `from` and `to` dates
- `currency` **(required)**: Currency code (e.g., "USD", "INR")
- `currencySymbol` **(required)**: Symbol (e.g., "$", "₹")
- `netPay` **(required)**: Calculated net pay amount

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── payslip-editor.component.ts    # Main editor with split view
│   │   └── payslip-preview.component.ts   # Payslip preview renderer
│   ├── models/
│   │   └── payslip.models.ts              # TypeScript interfaces
│   ├── services/
│   │   └── payslip.service.ts             # Business logic & PDF generation
│   ├── app.ts                             # Root component
│   └── app.routes.ts                      # Routing configuration
├── styles.css                             # Global styles
└── index.html                             # HTML entry point
public/
└── sample-payslip.json                    # Sample data file
```

## 🛠️ Development

### Code Scaffolding

Generate a new component:
```bash
ng generate component component-name
```

Generate a new service:
```bash
ng generate service service-name
```

### Building for Production

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory.

### Running Tests

```bash
npm test
```

## 🎨 Customization

### Styling

The application uses Tailwind CSS. Modify styles by:
- Editing component templates (inline classes)
- Updating `src/styles.css` for global styles
- Configuring Tailwind in `tailwind.config.js` (if needed)

### Templates

To create custom payslip templates:
1. Modify the template in [payslip-preview.component.ts](src/app/components/payslip-preview.component.ts)
2. Adjust styling classes as needed
3. Maintain the element ID for PDF generation

## 📋 Best Practices

- ✅ Use only standalone components
- ✅ Leverage Angular signals for state management
- ✅ Implement OnPush change detection strategy
- ✅ Use `input()` and `output()` functions instead of decorators
- ✅ Use native control flow (`@if`, `@for`, `@switch`)
- ✅ Follow TypeScript strict mode
- ✅ Ensure WCAG AA accessibility compliance

## 🚢 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist/payslips-generator/browser` folder to Netlify

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Angular](https://angular.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- PDF generation using [jsPDF](https://github.com/parallax/jsPDF) and [html2canvas](https://html2canvas.hertzen.com/)

## 📧 Support

For issues, questions, or suggestions, please [open an issue](https://github.com/yourusername/payslips-generator/issues) on GitHub.

---

Made with ❤️ using Angular 21

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
