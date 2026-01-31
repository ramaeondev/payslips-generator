---
description: 'We needed build an Angular application based on lastest Angular version that displays payslips for employees.'
tools: []
---
1. Set up a new Angular project using the Angular CLI based on the latest Angular version 21.
1.1. Configure the project with necessary dependencies and folder structure.
1.2. Set up routing for the application.
1.3. Install Tailwind CSS for styling the application.
1.4. Set up Angular Reactive Forms for handling user inputs and validations.
1.5. Configure state management using Angular Signals.
1.6 ONly Standalone components should be used.
2. User should generate payslips for employees by entering their details such as name, employee ID, designation, salary, deductions, and bonuses.
3. Create a component to display the payslip in a well-formatted manner.
4. Implement functionality to download the payslip as a PDF.
5. Add styling to the payslip to make it visually appealing.
6. Admin Can add any number of empoyee details inside fields.
7. All inputs should have validation to ensure data integrity.
8. We needed a proper preview of the payslip before downloading.
9. Ensure the application is responsive and works well on different devices.
10. A payslip container Header with company logo and details.
11. Footer with company contact information and disclaimers.
12. Singnature section for authorized personnel.
13. Implement error handling for invalid inputs.
14. Payslip body contains employee details, salary breakdown, deductions, bonuses, and net pay.
15. Netpay in words as well as in numbers.
16. Test the application thoroughly to ensure all functionalities work as expected.
17. Admin or user should be able to print the payslip directly from the application.
18. Salary componnets can be added or removed dynamically by the admin.
19. Any number of salary components can be added by the admin.
20. Use tailwindcss for styling the application.
21. Use Angular Reactive Forms for handling user inputs and validations.
22. Use Angular 21 template control-flow macros: prefer `@if` and `@for` in templates — **do not** use `*ngIf` or `*ngFor`.
23. Use Angular Signals for all component and application state (`signal`, `computed`, `effect`) with explicit TypeScript types. Avoid mutable plain variables for reactive state.
24. The `any` type is banned across the repository. Use explicit interfaces, `unknown` in `catch` blocks (with proper narrowing), or precise types instead of `any`.
25. Ensure the application follows best practices for Angular development.
26. Deploy the application to a suitable hosting platform using GitHub Actions for CI/CD (we prefer Vercel or Netlify).
25. Provide documentation on how to set up and run the application locally.
26. Include unit tests for all components and functionalities.
27. We needed generate payslips based on the json data as well as manual data entry.
28. Admin can upload json file containing employee payslip data to generate payslips.
29. Ensure proper formatting and alignment of all payslip elements.
30. Use open source libraries for PDF generation and any other required functionalities.
31. Ensure the application is accessible and follows web accessibility standards.
32. Provide options for different payslip templates that admin can choose from.
33. We dont needed any backend for this application it should be purely frontend based application.
34. Ensure the application is optimized for performance and loads quickly.
35. Json file structure should be documented for admin to upload the correct format.
36. Provide a sample json file for testing purposes.
37. Admin can preview the payslip template before generating payslips from json data.
38. A payslip can be generated for multiple employees at once based on the uploaded json data for multiple months/periods as well.
39. Organization details like name, address, contact info should be configurable by the admin.
40. Employee details should include fields like name, employee ID, designation, department, and joining date.
41. Salary breakdown should include basic salary, allowances, deductions, taxes, and net pay.
42. Deductions can include items like provident fund, professional tax, and other deductions.
43. Bonuses can include performance bonuses, holiday bonuses, and other incentives.
44. The application should support multiple currencies for salary components.
45. Admin can set the currency format for the payslip.
46. The payslip should include a unique payslip number for reference.
47. No Documentaions as markdowns are needed inside the repository unless asked specifically.