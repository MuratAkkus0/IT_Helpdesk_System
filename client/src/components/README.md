# Component Architecture - Atomic Design

This project is organized using the Atomic Design methodology. This approach provides a more sustainable and scalable codebase by organizing UI components in a hierarchical structure.

## Directory Structure

```
components/
├── atoms/           # Basic UI elements
├── molecules/       # Combinations of atoms
├── organisms/       # Complex UI components
├── templates/       # Page templates
└── index.js        # Central export file
```

## Atomic Design Levels

### 🔸 Atoms

Basic, indivisible UI elements. These are the smallest building blocks of the project.

- **Button.jsx** - All button variants
- **Input.jsx** - Form input elements
- **Select.jsx** - Dropdown selection elements
- **Badge.jsx** - Status and label display

### 🔹 Molecules

Meaningful combinations of atoms. Small components that perform a specific function.

- **SearchBar.jsx** - Search input and icon
- **FilterGroup.jsx** - Filtering controls

### 🔷 Organisms

Complex UI components composed of molecules and atoms. They represent specific sections of the page.

- **Header.jsx** - Top navigation bar
- **Sidebar.jsx** - Side navigation menu
- **Dashboard.jsx** - Main dashboard component
- **TicketForm.jsx** - Ticket creation form
- **TicketList.jsx** - Ticket list and management

### 🔶 Templates

Page templates that bring organisms together. Content-independent layout structures.

- **Layout.jsx** - Main page template (MainLayout)

## Usage

### Individual Import

```javascript
import Button from "./components/atoms/Button.jsx";
import Header from "./components/organisms/Header.jsx";
```

### Central Import

```javascript
import { Button, Header, Dashboard } from "./components";
```

## Best Practices

### 1. **Single Responsibility Principle**

Each component should be responsible for only one function.

### 2. **Configuration via Props**

Components should be configurable through props.

### 3. **Consistent Naming**

- File names PascalCase (TicketForm.jsx)
- Component names PascalCase (TicketForm)
- Props names camelCase (onClick, isVisible)

### 4. **Reusability**

Lower level components (atoms, molecules) should be reusable whenever possible.

## Component Props Patterns

### Atoms

```javascript
// Button example
<Button
  variant="primary"
  size="md"
  disabled={false}
  loading={false}
  onClick={handleClick}
>
  Click
</Button>
```

### Organisms

```javascript
// Header example
<Header
  title="Dashboard"
  searchQuery={query}
  onSearchChange={setQuery}
  showSearch={true}
  onNavigate={navigate}
/>
```

## Styling

- **Tailwind CSS** is used
- Consistent color palette (gray-800, blue-600, etc.)
- Responsive design first approach
- Dark theme focused design

## Type Safety

For future TypeScript integration:

- Props interfaces will be defined
- Type parameters for generic components
- Strict typing for API responses

Thanks to this structure, your code becomes more modular, testable and maintainable.
