# **App Name**: SpenseFlow

## Core Features:

- Secure User Authentication: Enable users to log in with their phone number using OTP (Firebase Auth) and store essential user profiles in Firestore.
- Personal Expense Tracking: Allow users to add personal expenses with amount, category, date, and optional notes, saving them to Firestore.
- Group Creation & Management: Users can create new groups, add or remove members, and view shared expenses within each group.
- Advanced Group Expense Splitting: Support sophisticated group expense splitting methods including equal, unequal, and percentage-based distribution, all managed in Firestore.
- Automated Balance Calculation: Automatically compute who owes whom and the net balance within groups, ensuring clear financial reconciliation powered by a backend calculation tool.
- Interactive Dashboard Overview: Provide a personalized dashboard displaying total spent, money owed to/by the user, and a stream of recent transactions.
- Visual Analytics & Insights: Present expense data through various charts including pie charts for categories, line charts for monthly trends, and bar charts for group vs. personal spending, enhancing understanding with a data analysis tool.

## Style Guidelines:

- Primary color: A sophisticated deep indigo (`#432E8C`) evoking trustworthiness and organization for key interactive elements.
- Background color: A very light lavender-grey (`#F2F1F7`) providing a clean and understated canvas for content.
- Accent color: A vibrant blue (`#3380FF`) to highlight important actions, notifications, and interactive elements, ensuring visual clarity and contrast.
- Headline font: 'Space Grotesk' (sans-serif) for a modern, tech-forward, and clear visual presence in titles and section headings.
- Body text font: 'Inter' (sans-serif) for high readability and a neutral, objective feel suitable for detailed financial data and notes.
- Utilize a consistent set of crisp, minimalist line icons to represent expense categories, actions (e.g., add, edit), and navigation, ensuring clarity and modern aesthetics.
- Implement a responsive and adaptive grid-based layout that prioritizes content legibility on all devices. Key financial data should be presented with a clear visual hierarchy and ample whitespace for focus.
- Incorporate subtle and performant micro-interactions and transitions, such as smooth loading states, animated chart renders, and feedback on successful actions, enhancing user experience without distraction.