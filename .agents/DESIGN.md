Create a clean, modern UI for a simple personal budget application. Focus on layout, reusable components, clear navigation, and good UX. The app should feel minimal, professional, and responsive, with a desktop-first dashboard and solid mobile behavior.

General requirements:

- Use a clean dashboard style with a sidebar layout after authentication.
- Keep the visual design simple, modern, and polished.
- Use reusable UI components.
- Use clear spacing, card-based sections, rounded corners, subtle shadows, and strong visual hierarchy.
- Make the whole app responsive.
- Use English for all labels, headings, buttons, placeholders, and helper text.
- Do not implement backend logic. Focus on pages, components, states, and interactions.

Routes and pages:

1. `/auth`
   Create a single authentication page with one centered auth card.
   Inside the card, add tabs to switch between:

- Sign In
- Sign Up

Both tab views should contain a form with:

- Email input
- Password input
- Primary submit button

Design expectations:

- Clean auth layout
- Simple logo/title area above the form
- Tabbed interface inside the card
- Form validation states in UI
- Proper input labels and placeholders
- Responsive centered layout

2. `/`
   Create the main dashboard page shown after login.
   This page should use a dashboard layout with a left sidebar and a main content area.

Sidebar requirements:

- App/logo area at the top
- Navigation links:
  - Dashboard
  - Incomes
  - Expenses
- Logout button pinned at the bottom of the sidebar

Dashboard content requirements:

- Page heading
- Summary cards for the current month:
  - Total Incomes
  - Total Expenses
  - Current Balance
- Use a simple card layout for these values
- Optionally include small icons or trend indicators
- Keep it visually clean and readable

3. `/incomes`
   Create a page that displays a paginated table or list of income entries.
   Each entry should show basic information in a readable row/card format.

Page requirements:

- Page title
- “Add Income” button at the top
- Paginated table or list of entries
- Each row/item should include:
  - Description / title
  - Total amount
  - Date or basic metadata
  - Edit button or link
  - Delete button

Interactions:

- Edit should navigate to `/incomes/:id`
- Delete should open a confirmation modal before removing the item

4. `/expenses`
   Create a page that displays a paginated table or list of expense entries.
   This should mirror the incomes page but for expenses.

Page requirements:

- Page title
- “Add Expense” button at the top
- Paginated table or list of entries
- Each row/item should include:
  - Description / title
  - Total amount
  - Date or basic metadata
  - Edit button or link
  - Delete button

Interactions:

- Edit should navigate to `/expenses/:id`
- Delete should open a confirmation modal before removing the item

5. `/incomes/add`
   Create a form page for adding a new income record.

6. `/expenses/add`
   Create a form page for adding a new expense record.

7. `/incomes/:id`
   Create an edit page for an existing income record.

8. `/expenses/:id`
   Create an edit page for an existing expense record.

Form requirements for add/edit income and expense pages:
These pages should use the same reusable form design.
The form should support multiple line items inside one record.

Each line item should contain:

- Description input
- Price input
- Quantity input

Behavior and UI:

- Button to add a new line item
- Button to remove the current line item
- Automatically calculate line total from price × quantity
- Show a summary section at the bottom with the total sum of all line items
- Use a clean card or section-based form layout
- Include primary save action and secondary cancel action
- Keep edit and create views visually consistent

Modal requirements:
Create a reusable confirmation modal for deleting an income or expense.
The modal should include:

- Clear title
- Short confirmation message
- Cancel button
- Confirm delete button
  Make the destructive action visually distinct.

Component expectations:
Create reusable components for:

- Auth form card with tabs
- Sidebar navigation
- Dashboard summary cards
- Data table or list for incomes and expenses
- Pagination controls
- Confirmation modal
- Reusable record form
- Reusable line item row
- Total summary section
- Page header with action button

Visual style:

- Minimal and modern
- Professional finance app aesthetic
- Neutral base colors with one clear accent color
- Good contrast and accessible typography
- Clear hover, focus, active, empty, and disabled states
- Consistent spacing and alignment

Sample content:
Use realistic demo data for incomes and expenses so the pages look complete and believable.

Deliver:

- Full UI structure for all pages listed above
- Reusable components
- Responsive layouts
- Good empty states, pagination states, and modal states
- Clean navigation flow between auth, dashboard, list pages, and add/edit pages
