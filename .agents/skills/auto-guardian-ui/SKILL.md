---
name: auto-guardian-ui
description: "Premium, technical, minimalist UI guidance for Auto-Guardian. Use when redesigning or creating Expo React Native screens, navigation, dashboards, forms, alerts, expense flows, document views, or reusable UI components for vehicles, services, repairs, reminders, and stats."
license: MIT
---

# Auto-Guardian UI Skill

Project-specific guidance for elevating Auto-Guardian with a premium, technical, and minimalist interface while keeping everyday vehicle maintenance tracking precise and practical.

## When to Apply

Use this skill when:

- redesigning an existing screen in Auto-Guardian
- creating a new screen or reusable component
- improving home, vehicle detail, maintenance, repair, expense, document, or alert layouts
- refactoring repetitive visual patterns into shared UI pieces
- reviewing whether a new UI fits the app's product style

## Core Direction

- Optimize for precision and confidence. The user should understand vehicle status, upcoming work, recorded costs, and pending actions in one quick scan.
- Make operational priorities explicit: urgent alerts first, primary record details second, supporting metadata last.
- Prefer a premium workshop-console tone: polished surfaces, restrained accents, crisp hierarchy, and no decorative excess.
- Dense information is acceptable, but it must be structured into cards, labeled sections, summary rows, or timeline blocks with disciplined hierarchy.
- Use color as a semantic system for urgency, progress, status, and action intent. Avoid ornamental color usage.

## Project Anchors

- Reuse the responsive system in `src/utils/responsive.js` for spacing, radius, icon sizing, and font scaling.
- Keep navigation changes aligned with `src/navigation/AppNavigator.js`, where the main stack and tab structure live.
- Reuse the theme contract in `src/context/ThemeContext.js` so light and dark mode stay coherent.
- Prefer shared primitives in `src/components/common`, `src/components/vehicles`, and `src/components/maintenance` when the same pattern appears across multiple screens.
- Preserve existing business logic and data flow; UI work should sit on top of the current hooks, contexts, and services rather than bypassing them.

## Screen Guidelines

### Home and Summary

- Lead with the most relevant daily signals: pending maintenance, urgent reminders, recent expenses, and direct access to vehicles.
- Separate summary cards from action shortcuts so the home screen reads like an operational dashboard, not a button wall.
- Highlight only the alerts that change the user's next action. Avoid turning every metric into a warning state.

### Vehicle Detail

- Surface identity, current mileage, upcoming service, and recent history before secondary metadata.
- Use sectioning so overview, documents, expenses, and maintenance records feel coordinated but clearly separated.

### Maintenance, Repairs, and Expenses

- Keep service type, date, mileage, cost, and notes visually structured and easy to compare.
- Group forms by intent: service details, scheduling, financials, and attachments.
- Dangerous or irreversible actions should be isolated, quiet, and unmistakably labeled.

### Documents and Alerts

- Make due dates, status, and document type easy to scan without opening every record.
- Alerts should communicate severity clearly while still preserving calm, readable layouts.

### Empty and Loading States

- Empty states should tell the user what to do next, such as adding a vehicle, recording the first maintenance, or attaching a document.
- Loading states should preserve layout structure when possible so the screen does not jump excessively.

## Copy and Tone

- Write UI copy in concise Spanish.
- Prefer short operational language with technical precision when it improves clarity.
- Buttons should start with clear verbs.
- Section titles should orient quickly and sound deliberate, never promotional.

## Implementation Heuristics

- Keep visual systems consistent before adding new visual ideas.
- Extract shared card, header, stat, alert, and form-row patterns when duplication appears in three or more places.
- For new interactive UI, prefer touch targets and spacing that remain comfortable on phones and small tablets.
- If a visual improvement makes the workflow less obvious, reject it.
- When in doubt, remove one layer of noise before adding one layer of polish.