# VersionInfo Component

A reusable floating box component that displays version information in the bottom left corner of any page.

## Features
- Fixed position in bottom left corner
- Displays version number, development status, and last updated date
- Responsive design with mobile support
- Dark mode support
- Smooth hover animations
- Fully customizable via props

## Usage

### Basic Usage (with default values)
```jsx
import VersionInfo from '../components/VersionInfo';

function YourPage() {
  return (
    <div>
      {/* Your page content */}
      <VersionInfo />
    </div>
  );
}
```

### Custom Values
```jsx
import VersionInfo from '../components/VersionInfo';

function YourPage() {
  return (
    <div>
      {/* Your page content */}
      <VersionInfo 
        version="1.0.0"
        status="Beta"
        lastUpdated="Dec 2024"
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `version` | string | "0.1.0" | The version number to display |
| `status` | string | "Under Development" | Development status (e.g., "Beta", "Stable", "Alpha") |
| `lastUpdated` | string | Current date | Last update date in any format |

## Examples

### Different Status Values
```jsx
// Development
<VersionInfo status="Under Development" />

// Beta
<VersionInfo status="Beta" />

// Production
<VersionInfo status="Stable" />

// Alpha
<VersionInfo status="Alpha" />
```

### With Dynamic Date
```jsx
<VersionInfo 
  version="2.0.0"
  status="Production"
  lastUpdated={new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })}
/>
```

## Styling

The component uses `versioninfo.css` for styling. You can customize the appearance by modifying:
- Position: Change `bottom` and `left` values
- Colors: Modify background, text, and status colors
- Size: Adjust padding, font-size, and min-width
- Effects: Customize box-shadow, border-radius, and transitions

## Notes
- The component has a z-index of 1000 to ensure it appears above most content
- It's responsive and adjusts for mobile screens (< 768px)
- Supports both light and dark color schemes
