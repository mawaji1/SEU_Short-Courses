# Learner Experience - Information Architecture & Design System

**Product:** SEU Short Courses - Learning Management Platform
**User Type:** Education/Learning Dashboard
**Primary User:** Individual learner enrolled in multiple courses
**Date:** 2026-01-24

---

## 🎯 Core UX Principles

### 1. **Dashboard-Centric Design**
The dashboard is the **command center** - everything radiates from here.

### 2. **Persistent Context**
User always knows: "Where am I? What course am I viewing? How do I get back?"

### 3. **Reduce Cognitive Load**
Information is presented in progressive disclosure - overview first, details on demand.

### 4. **Action-Oriented**
Every page answers: "What should I do next?"

---

## 📐 Information Architecture

### **Recommended Structure:**

```
✅ RECOMMENDED (Hierarchical & Clear):

┌─────────────────────────────────────────────────────┐
│  SHELL LAYOUT (Persistent across all pages)        │
│  ┌──────────────┬─────────────────────────────┐   │
│  │  SIDEBAR     │  MAIN CONTENT               │   │
│  │  - Dashboard │  (Page content here)        │   │
│  │  - My Courses│                             │   │
│  │  - Calendar  │                             │   │
│  │  - Messages  │                             │   │
│  └──────────────┴─────────────────────────────┘   │
└─────────────────────────────────────────────────────┘

/dashboard                    → Overview + Stats + Today's Actions
├── /my-courses              → Course list (with sidebar)
│   └── /course/[id]         → Course hub with TABS (not separate pages!)
│       ├── Tab: Overview    → Curriculum, instructor, materials
│       ├── Tab: Progress    → Attendance, completion, certificate
│       ├── Tab: Messages    → Instructor announcements
│       └── Tab: Materials   → Downloads
├── /calendar                → All sessions across all courses
└── /messages                → All messages from all instructors
```

---

## 🎨 Design System - Education Dashboard

### **Style Pattern: Clean Academic**

**Characteristics:**
- Professional, trustworthy, accessible
- Clear hierarchy, excellent readability
- Calm colors (not overstimulating)
- Generous whitespace
- Focus on content over decoration

### **Color Palette: Educational Trust**

```css
/* Primary - Professional Blue */
--primary-50:  #EFF6FF;  /* Lightest background */
--primary-100: #DBEAFE;
--primary-200: #BFDBFE;
--primary-500: #3B82F6;  /* Main brand */
--primary-600: #2563EB;  /* Hover states */
--primary-700: #1D4ED8;  /* Active states */
--primary-900: #1E3A8A;  /* Text on light bg */

/* Success - Green (for completion, certificates) */
--success-50:  #F0FDF4;
--success-500: #22C55E;
--success-700: #15803D;

/* Warning - Amber (for pending, in-progress) */
--warning-50:  #FFFBEB;
--warning-500: #F59E0B;
--warning-700: #B45309;

/* Neutral - Slate (main UI) */
--slate-50:  #F8FAFC;  /* Page background */
--slate-100: #F1F5F9;  /* Card background */
--slate-200: #E2E8F0;  /* Borders */
--slate-600: #475569;  /* Secondary text */
--slate-900: #0F172A;  /* Primary text */
```

### **Typography:**

**Arabic (Primary):**
- Font Family: `'Cairo', sans-serif` (Google Fonts)
- Headings: 600-700 weight
- Body: 400-500 weight
- Line height: 1.6 (Arabic needs more breathing room)

**English (Secondary):**
- Font Family: `'Inter', sans-serif`
- Headings: 600-700 weight
- Body: 400-500 weight

**Scale:**
```css
--text-xs:   0.75rem;  /* 12px - labels, meta */
--text-sm:   0.875rem; /* 14px - secondary text */
--text-base: 1rem;     /* 16px - body text */
--text-lg:   1.125rem; /* 18px - emphasized */
--text-xl:   1.25rem;  /* 20px - card titles */
--text-2xl:  1.5rem;   /* 24px - section headers */
--text-3xl:  1.875rem; /* 30px - page titles */
--text-4xl:  2.25rem;  /* 36px - hero titles */
```

### **Spacing System:**

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### **Component Patterns:**

#### **1. Dashboard Layout**
```
┌──────────────────────────────────────────────────────┐
│ HEADER: Logo + User Menu + Notifications            │
├────────────┬─────────────────────────────────────────┤
│  SIDEBAR   │  MAIN CONTENT                           │
│  260px     │                                         │
│            │  ┌─ PAGE HEADER ─────────────────────┐ │
│  Nav Items │  │ Title + Breadcrumbs + Actions    │ │
│  - Active  │  └──────────────────────────────────┘ │
│  - Hover   │                                         │
│            │  ┌─ STATS CARDS ─────────────────────┐ │
│            │  │ 3-4 metric cards in grid         │ │
│            │  └──────────────────────────────────┘ │
│            │                                         │
│            │  ┌─ MAIN CONTENT AREA ───────────────┐ │
│            │  │                                   │ │
│            │  │                                   │ │
│            │  └───────────────────────────────────┘ │
└────────────┴─────────────────────────────────────────┘
```

#### **2. Course Hub - Tab Pattern**
```
┌──────────────────────────────────────────────────────┐
│ Course Header (Title, Progress Bar, Quick Stats)    │
├──────────────────────────────────────────────────────┤
│ TABS: [ Overview ] [ Progress ] [ Messages ] [Files]│
├──────────────────────────────────────────────────────┤
│                                                      │
│  Tab Content Here (Changes without page reload)     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### **3. Card Design**
```css
.card {
  background: white;
  border: 1px solid var(--slate-200);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: box-shadow 200ms, border-color 200ms;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border-color: var(--primary-200);
}

.card-interactive {
  cursor: pointer;
}
```

---

## 🔧 Implementation Priorities

### **Phase 1: Core Shell (HIGH PRIORITY)**
1. Create persistent shell layout with sidebar
2. Implement dashboard overview page
3. Add breadcrumb navigation
4. Ensure sidebar highlights active page

### **Phase 2: Course Hub Tabs (HIGH PRIORITY)**
1. Convert course detail to tab interface
2. Tabs: Overview, Progress, Messages, Materials
3. Client-side tab switching (no page reloads)
4. Maintain course context across tabs

### **Phase 3: Dashboard Content (MEDIUM)**
1. Today's sessions widget
2. Recent messages widget
3. Progress summary across all courses
4. Quick actions (upcoming deadlines, pending certificates)

### **Phase 4: Calendar View (LOW)**
1. Global calendar of all sessions
2. Filter by course
3. Add to personal calendar (iCal export)

---

## 📋 UX Checklist for Implementation

### **Navigation & Context**
- [ ] Sidebar navigation visible on all pages
- [ ] Active page highlighted in sidebar
- [ ] Breadcrumbs show full path
- [ ] Course switcher in course pages
- [ ] Back button behavior is predictable

### **Information Hierarchy**
- [ ] Dashboard shows overview first, details on click
- [ ] Stats cards above detailed lists
- [ ] Most important info above the fold
- [ ] Progressive disclosure (expand/collapse)

### **Visual Consistency**
- [ ] Same card style across all pages
- [ ] Consistent spacing (use spacing scale)
- [ ] Consistent button styles
- [ ] Consistent color usage (success=green, warning=amber)

### **Accessibility**
- [ ] All interactive elements have cursor-pointer
- [ ] Focus states visible on all interactive elements
- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader friendly (aria-labels)

### **Performance**
- [ ] Tab switching is instant (client-side)
- [ ] Loading states for async data
- [ ] Skeleton screens (not just spinners)
- [ ] Images lazy loaded

### **Mobile Responsive**
- [ ] Sidebar becomes hamburger menu on mobile
- [ ] Stats cards stack vertically
- [ ] Tables become cards on mobile
- [ ] Touch targets ≥ 44x44px

---

## 🎯 Key User Flows

### **Flow 1: Daily Check-in**
```
User arrives → Dashboard
  ↓
Sees "Today's Sessions" widget → Clicks session
  ↓
Goes to Course Hub (Overview tab) → Clicks "Join Session"
  ↓
Zoom opens
```

### **Flow 2: Check Progress**
```
User arrives → Dashboard
  ↓
Sees "My Courses" with progress bars → Clicks course
  ↓
Course Hub opens → Switches to "Progress" tab
  ↓
Views attendance, certificate status
```

### **Flow 3: Read Message**
```
User arrives → Dashboard
  ↓
Sees notification badge on Messages → Clicks Messages in sidebar
  ↓
All messages from all courses → Filters by course
  ↓
Reads message
```

---

## 🚫 Anti-Patterns to Avoid

1. **❌ Deep nesting** - No more than 2 levels deep
2. **❌ Isolated pages** - Use tabs within course hub
3. **❌ No context** - Always show where user is
4. **❌ Hunt & peck** - Dashboard should surface everything
5. **❌ Inconsistent patterns** - One way to do things
6. **❌ Page-per-feature** - Use tabs, modals, accordions
7. **❌ No visual feedback** - Hover, active, focus states required
8. **❌ Emoji icons** - Use Lucide React icons only

---

## 📊 Metrics for Success

After redesign, measure:
- **Time to find information** (should decrease)
- **Number of clicks to complete task** (should decrease)
- **User confusion reports** (should decrease to near zero)
- **Session engagement** (time on platform should increase)
- **Completion rates** (easier navigation = more completions)

---

**Next Steps:**
1. Review and approve this IA
2. Create shell layout component
3. Refactor existing pages to fit new structure
4. Add dashboard overview
5. Convert course detail to tabbed interface
