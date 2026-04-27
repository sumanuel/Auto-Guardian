---
description: "Use when designing or editing Auto-Guardian mobile UI in screens, navigation, theme, responsive layout, or reusable components. Covers visual direction, vehicle maintenance workflow hierarchy, alert clarity, expense and document views, empty states, and touch-friendly actions for this Expo React Native project."
name: "Auto-Guardian UI"
applyTo: "App.js,src/screens/**/*.js,src/components/**/*.js,src/navigation/**/*.js,src/context/ThemeContext.js,src/utils/responsive.js"
---

# Auto-Guardian UI Guidelines

- Design for fast decision-making around vehicle care. The app should help the user understand what needs attention, what it costs, and what comes next without visual clutter.
- Prioritize high-frequency flows in the visual hierarchy: home summary, vehicle detail, maintenance registration, repair logging, expenses, documents, and alerts.
- Keep one primary action clearly dominant per screen. Secondary actions should support review and tracking, not compete with the main task.
- Use the existing helpers from `src/utils/responsive.js` and the current theme structure in `src/context/ThemeContext.js` instead of hard-coded spacing, type, and sizing when practical.
- Prefer grouped cards, summary blocks, and section headers over long undifferentiated layouts. Vehicle information, maintenance status, and supporting notes should read in clear layers.
- Mileage, dates, costs, and urgency indicators should be visually stable and easy to scan at a glance.
- Alerts must feel trustworthy, not noisy. Separate urgent maintenance from informative reminders and avoid making the whole screen look critical.
- Forms should feel calm and predictable. Group inputs by intent such as vehicle identity, service details, cost, dates, attachments, and notes.
- Document and expense screens should make proof and traceability obvious. Show status, due dates, category, and amount with strong alignment and restrained decoration.
- Empty states should be specific to the workflow: explain what is missing, why it matters, and give a direct next action such as adding a vehicle, recording a maintenance item, or attaching a document.
- Keep copy short, practical, and friendly in Spanish. Prefer operational language over technical wording.
- Destructive actions must be visually separated from save or confirm flows and should never look like the safest default action.
- Favor consistency across CRUD screens so vehicles, maintenances, repairs, expenses, documents, and settings share the same spacing rhythm and card hierarchy.