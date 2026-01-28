# JSON Format Documentation

## Overview

This document describes the JSON structure required for generating payslips using the Payslip Generator application.

## Complete JSON Structure

```json
{
  "organization": { ... },
  "payslips": [ ... ]
}
```

## Root Level Properties

### `organization` (required, object)

Contains information about the company/organization issuing the payslips.

**Properties:**

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `name` | string | Yes | Company name | "TechCorp Solutions Pvt Ltd" |
| `address` | string | Yes | Street address | "123 Business Park, Tower A" |
| `city` | string | Yes | City name | "Mumbai" |
| `state` | string | Yes | State/Province | "Maharashtra" |
| `zipCode` | string | Yes | Postal/ZIP code | "400001" |
| `country` | string | Yes | Country name | "India" |
| `phone` | string | Yes | Contact phone | "+91-22-12345678" |
| `email` | string | Yes | Contact email | "hr@techcorp.com" |
| `website` | string | No | Company website | "www.techcorp.com" |
| `logo` | string | No | Logo (base64 or data URI) | "data:image/svg+xml,..." |

### `payslips` (required, array)

Array of payslip objects, one for each employee/period.

## Payslip Object Structure

Each object in the `payslips` array must contain:

### Basic Information

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `payslipNumber` | string | Yes | Unique identifier | "PAY-2026-001-001" |
| `month` | string | Yes | Month name | "January" |
| `year` | number | Yes | Year (4 digits) | 2026 |
| `currency` | string | Yes | Currency code | "INR", "USD" |
| `currencySymbol` | string | Yes | Currency symbol | "₹", "$" |
| `netPay` | number | Yes | Final net pay amount | 86800 |

### `payPeriod` (required, object)

Defines the pay period dates.

| Property | Type | Required | Description | Format |
|----------|------|----------|-------------|--------|
| `from` | string | Yes | Period start date | "YYYY-MM-DD" |
| `to` | string | Yes | Period end date | "YYYY-MM-DD" |

### `employee` (required, object)

Employee information for this payslip.

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `id` | string | Yes | Unique employee ID | "EMP001" |
| `name` | string | Yes | Full name | "Rajesh Kumar" |
| `designation` | string | Yes | Job title | "Senior Software Engineer" |
| `department` | string | Yes | Department | "Engineering" |
| `joiningDate` | string | Yes | Date of joining | "2022-03-15" |
| `bankAccount` | string | No | Bank account | "HDFC-XXXXXXXXX1234" |
| `panNumber` | string | No | Tax ID | "ABCDE1234F" |

### `salaryComponents` (required, array)

Array of salary component objects representing earnings and deductions.

Each component object must have:

| Property | Type | Required | Description | Values |
|----------|------|----------|-------------|--------|
| `name` | string | Yes | Component name | Any descriptive name |
| `amount` | number | Yes | Numeric value | Positive number |
| `type` | string | Yes | Component type | "earning" or "deduction" |

## Salary Component Examples

### Common Earnings
```json
{
  "name": "Basic Salary",
  "amount": 50000,
  "type": "earning"
}
```

```json
{
  "name": "House Rent Allowance (HRA)",
  "amount": 25000,
  "type": "earning"
}
```

```json
{
  "name": "Performance Bonus",
  "amount": 10000,
  "type": "earning"
}
```

### Common Deductions
```json
{
  "name": "Provident Fund (PF)",
  "amount": 6000,
  "type": "deduction"
}
```

```json
{
  "name": "Income Tax (TDS)",
  "amount": 8500,
  "type": "deduction"
}
```

## Complete Example

See `/public/sample-payslip.json` for a complete working example with two employees.

## Validation Rules

1. **Required Fields**: All fields marked as "Required" must be present
2. **Data Types**: Must match the specified types exactly
3. **Date Format**: All dates must be in "YYYY-MM-DD" format
4. **Component Types**: Must be exactly "earning" or "deduction" (lowercase)
5. **Net Pay Calculation**: Should equal (Total Earnings - Total Deductions)
6. **Positive Numbers**: All `amount` values must be positive numbers

## Tips

- Use descriptive names for salary components
- Keep payslip numbers unique across all payslips
- Ensure the logo (if provided) is a valid base64 data URI
- Test your JSON using the "Load Sample" button first
- Use the "Format" button to properly indent your JSON

## Currency Support

The application supports any currency. Just provide:
- `currency`: The currency code (ISO 4217 recommended but not enforced)
- `currencySymbol`: The symbol to display (e.g., "$", "€", "£", "¥", "₹")

## Multiple Employees/Periods

You can include multiple payslips in a single JSON file:
- Each payslip in the array represents one employee for one period
- All payslips share the same organization information
- Use the dropdown in the UI to switch between different payslips

## Error Messages

Common validation errors:

- **"Invalid JSON structure"**: Check for missing commas, brackets, or quotes
- **"Must include organization and payslips"**: Root level keys missing
- **"Payslips must be an array"**: Wrap payslips in square brackets `[]`
- **"Organization must have name and address"**: Required org fields missing
- **"Employee must have id and name"**: Required employee fields missing
