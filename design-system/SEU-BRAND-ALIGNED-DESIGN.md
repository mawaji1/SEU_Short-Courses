# SEU Short Courses - Brand-Aligned Design System

**Date:** 2026-01-24
**Based On:** Existing SEU brand colors + Uber/Coursera patterns
**Font:** IBM Plex Sans Arabic (already configured)

---

## 🎨 SEU Brand Colors (From tailwind.config.ts)

Your existing brand palette:

```css
/* SEU Official Brand Colors */
--seu-cyan:    #32B7A8;  /* PANTONE 3252C - Teal/Turquoise */
--seu-blue:    #0083BE;  /* PANTONE 7460C - Primary Blue */
--seu-purple:  #593888;  /* PANTONE 267C - Deep Purple */
--seu-navy:    #111E4D;  /* PANTONE 662C - Dark Navy */
--seu-orange:  #FFA300;  /* PANTONE 137 - Bright Orange */
--seu-lime:    #C4D600;  /* PANTONE 382 - Lime Green */
--seu-slate:   #5A6872;  /* PANTONE 7545 - Neutral Slate */
--seu-gray:    #D0D3D4;  /* PANTONE 427 - Light Gray */
```

---

## 🎯 Recommended Color Usage for Learner Experience

### **Primary: SEU Blue (#0083BE)**
**Use for:**
- Main navigation sidebar background (or gradients)
- Primary buttons (Join Session, Continue Learning)
- Active states in navigation
- Progress bars (in-progress)
- Links and interactive elements

```css
/* Examples */
.sidebar { background: linear-gradient(180deg, #0083BE 0%, #111E4D 100%); }
.btn-primary { background: #0083BE; }
.progress-bar { background: linear-gradient(90deg, #0083BE, #32B7A8); }
```

---

### **Success/Completion: SEU Cyan (#32B7A8)**
**Use for:**
- Completed checkmarks ✅
- Certificate badges 🏆
- "Eligible for certificate" indicators
- Success messages
- Progress bars (completed)

```css
/* Examples */
.completed-badge { color: #32B7A8; }
.certificate-icon { background: linear-gradient(135deg, #32B7A8, #0083BE); }
```

---

### **Warning/Deadline: SEU Orange (#FFA300)**
**Use for:**
- Upcoming deadlines
- "Session starts soon" alerts
- Pending actions
- Important notifications

```css
/* Examples */
.deadline-badge { background: #FFA300; color: #111E4D; }
.session-soon { border-left: 4px solid #FFA300; }
```

---

### **Accent/Highlight: SEU Purple (#593888)**
**Use for:**
- Featured courses
- Premium/special content
- Hover states on important cards
- Tertiary buttons

```css
/* Examples */
.featured-course { border: 2px solid #593888; }
.btn-tertiary:hover { background: #593888; }
```

---

### **Text & Backgrounds:**

```css
/* Primary Text */
--text-primary: #111E4D;    /* SEU Navy - Main headings */
--text-secondary: #5A6872;  /* SEU Slate - Body text, descriptions */
--text-muted: #A0A8AF;      /* Lighter than slate - Meta info */

/* Backgrounds */
--bg-page: #F7F9FA;         /* Off-white page background */
--bg-card: #FFFFFF;         /* White cards */
--bg-sidebar: linear-gradient(180deg, #0083BE 0%, #111E4D 100%);

/* Borders */
--border-light: #D0D3D4;    /* SEU Gray - Subtle borders */
--border-medium: #A0A8AF;   /* Stronger borders */
```

---

## 🎨 Color Palette for Statuses

### **Course Status Colors:**

```css
/* IN_PROGRESS - Blue Gradient */
.course-in-progress {
  background: linear-gradient(135deg, #0083BE, #32B7A8);
  color: white;
}

/* COMPLETED - Cyan/Green */
.course-completed {
  background: linear-gradient(135deg, #32B7A8, #C4D600);
  color: #111E4D;
}

/* UPCOMING - Purple */
.course-upcoming {
  background: linear-gradient(135deg, #593888, #0083BE);
  color: white;
}

/* FAILED/INCOMPLETE - Orange */
.course-failed {
  background: linear-gradient(135deg, #FFA300, #FF6B00);
  color: white;
}
```

---

## 📐 Typography (IBM Plex Sans Arabic - Already Configured!)

You're already using **IBM Plex Sans Arabic** - excellent choice for Arabic!

### **Font Scale:**

```css
/* Already in your globals.css */
font-family: 'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Recommended Scale */
--text-xs:   0.75rem;  /* 12px - Labels, badges */
--text-sm:   0.875rem; /* 14px - Secondary info */
--text-base: 1rem;     /* 16px - Body text */
--text-lg:   1.125rem; /* 18px - Emphasized text */
--text-xl:   1.25rem;  /* 20px - Card titles */
--text-2xl:  1.5rem;   /* 24px - Section headings */
--text-3xl:  1.875rem; /* 30px - Page titles */
--text-4xl:  2.25rem;  /* 36px - Hero titles */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### **Line Heights (RTL Optimized):**

```css
/* Arabic needs more vertical space */
--leading-tight: 1.4;
--leading-normal: 1.6;   /* Body text */
--leading-relaxed: 1.75;
--leading-loose: 2;
```

---

## 🎭 Component Examples with SEU Branding

### **1. Dashboard Hero Card (Next Session)**

```tsx
<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-seu-blue via-seu-cyan to-seu-purple p-8 text-white shadow-2xl">
  {/* Background Pattern */}
  <div className="absolute inset-0 opacity-10">
    <div className="absolute inset-0 bg-[url('/patterns/dots.svg')]" />
  </div>

  {/* Content */}
  <div className="relative z-10">
    <div className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
      🎯 الجلسة القادمة
    </div>

    <h2 className="mb-2 text-3xl font-bold">
      أساسيات الذكاء الاصطناعي
    </h2>

    <p className="mb-6 text-white/90">
      اليوم الساعة 7:00 مساءً • د. أحمد العتيبي
    </p>

    <button className="rounded-xl bg-white px-8 py-3 font-bold text-seu-blue shadow-lg transition-transform hover:scale-105">
      الانضمام الآن 🚀
    </button>
  </div>
</div>
```

---

### **2. Stats Cards**

```tsx
<div className="grid gap-4 md:grid-cols-3">
  {/* Active Courses */}
  <div className="rounded-xl border-2 border-seu-blue bg-white p-6 shadow-sm">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-sm font-medium text-seu-slate">دورات نشطة</span>
      <div className="rounded-lg bg-seu-blue/10 p-2">
        <BookOpen className="h-5 w-5 text-seu-blue" />
      </div>
    </div>
    <p className="text-3xl font-bold text-seu-navy">3</p>
    <p className="mt-1 text-xs text-seu-slate">قيد التقدم</p>
  </div>

  {/* Completed Courses */}
  <div className="rounded-xl border-2 border-seu-cyan bg-white p-6 shadow-sm">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-sm font-medium text-seu-slate">دورات مكتملة</span>
      <div className="rounded-lg bg-seu-cyan/10 p-2">
        <CheckCircle2 className="h-5 w-5 text-seu-cyan" />
      </div>
    </div>
    <p className="text-3xl font-bold text-seu-navy">2</p>
    <p className="mt-1 text-xs text-seu-slate">✅ شهادة جاهزة</p>
  </div>

  {/* Overall Progress */}
  <div className="rounded-xl border-2 border-seu-purple bg-white p-6 shadow-sm">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-sm font-medium text-seu-slate">التقدم الإجمالي</span>
      <div className="rounded-lg bg-seu-purple/10 p-2">
        <TrendingUp className="h-5 w-5 text-seu-purple" />
      </div>
    </div>
    <p className="text-3xl font-bold text-seu-navy">67%</p>
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
      <div className="h-full w-[67%] rounded-full bg-gradient-to-r from-seu-blue to-seu-cyan" />
    </div>
  </div>
</div>
```

---

### **3. Sidebar Navigation (SEU Gradient)**

```tsx
<aside className="flex h-screen w-64 flex-col bg-gradient-to-b from-seu-blue to-seu-navy text-white">
  {/* Logo */}
  <div className="border-b border-white/10 p-6">
    <h1 className="text-xl font-bold">الجامعة السعودية الإلكترونية</h1>
    <p className="text-sm text-white/70">الدورات القصيرة</p>
  </div>

  {/* Navigation */}
  <nav className="flex-1 space-y-1 p-4">
    <a href="/dashboard" className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3 font-medium transition-colors hover:bg-white/20">
      <LayoutDashboard className="h-5 w-5" />
      <span>لوحة التحكم</span>
    </a>

    <a href="/my-courses" className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-white/70 transition-colors hover:bg-white/10">
      <BookOpen className="h-5 w-5" />
      <span>دوراتي</span>
    </a>

    <a href="/calendar" className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-white/70 transition-colors hover:bg-white/10">
      <Calendar className="h-5 w-5" />
      <span>التقويم</span>
    </a>

    <a href="/messages" className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-white/70 transition-colors hover:bg-white/10">
      <Mail className="h-5 w-5" />
      <span>الرسائل</span>
      <span className="mr-auto rounded-full bg-seu-orange px-2 py-0.5 text-xs font-bold text-white">2</span>
    </a>
  </nav>

  {/* User Profile */}
  <div className="border-t border-white/10 p-4">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-seu-cyan font-bold">
        م
      </div>
      <div className="flex-1">
        <p className="font-medium">محمد أحمد</p>
        <p className="text-xs text-white/70">متعلم</p>
      </div>
    </div>
  </div>
</aside>
```

---

### **4. Course Card (Status-Driven)**

```tsx
{/* IN PROGRESS Course */}
<div className="group cursor-pointer overflow-hidden rounded-xl border-2 border-seu-blue bg-white shadow-sm transition-all hover:shadow-lg">
  {/* Header - Gradient */}
  <div className="bg-gradient-to-r from-seu-blue to-seu-cyan p-4 text-white">
    <span className="inline-block rounded-full bg-white/20 px-2 py-1 text-xs font-medium">
      قيد التقدم
    </span>
  </div>

  {/* Body */}
  <div className="p-6">
    <h3 className="mb-2 text-xl font-bold text-seu-navy">
      أساسيات الذكاء الاصطناعي
    </h3>
    <p className="mb-4 text-sm text-seu-slate">
      د. أحمد العتيبي • 40 ساعة
    </p>

    {/* Progress */}
    <div className="mb-4">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-seu-navy">التقدم</span>
        <span className="font-bold text-seu-blue">65%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-seu-blue to-seu-cyan" />
      </div>
    </div>

    {/* Next Session */}
    <div className="flex items-center gap-2 rounded-lg bg-seu-orange/10 p-3">
      <Clock className="h-4 w-4 text-seu-orange" />
      <span className="text-sm font-medium text-seu-navy">
        الجلسة القادمة: اليوم 7:00 م
      </span>
    </div>
  </div>
</div>

{/* COMPLETED Course */}
<div className="group cursor-pointer overflow-hidden rounded-xl border-2 border-seu-cyan bg-white shadow-sm transition-all hover:shadow-lg">
  {/* Header - Gradient */}
  <div className="bg-gradient-to-r from-seu-cyan to-seu-lime p-4 text-seu-navy">
    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-xs font-medium">
      <CheckCircle2 className="h-3 w-3" />
      مكتمل
    </span>
  </div>

  {/* Body */}
  <div className="p-6">
    <h3 className="mb-2 text-xl font-bold text-seu-navy">
      التسويق الرقمي الاحترافي
    </h3>
    <p className="mb-4 text-sm text-seu-slate">
      د. سارة الشمري • 60 ساعة
    </p>

    {/* Completion Badge */}
    <div className="flex items-center gap-2 rounded-lg bg-seu-cyan/10 p-3">
      <Award className="h-4 w-4 text-seu-cyan" />
      <span className="text-sm font-medium text-seu-navy">
        🏆 شهادة جاهزة للتحميل
      </span>
    </div>
  </div>
</div>
```

---

### **5. Tab Interface (Course Hub)**

```tsx
<div className="rounded-xl border border-gray-200 bg-white shadow-sm">
  {/* Course Header - Sticky */}
  <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-6">
    <h1 className="mb-2 text-2xl font-bold text-seu-navy">
      أساسيات الذكاء الاصطناعي
    </h1>
    <p className="mb-4 text-sm text-seu-slate">
      د. أحمد العتيبي | 40 ساعة | الفوج 1
    </p>

    {/* Progress Bar */}
    <div className="mb-2 flex items-center justify-between text-sm">
      <span className="font-medium text-seu-navy">التقدم الإجمالي</span>
      <span className="font-bold text-seu-blue">65%</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
      <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-seu-blue to-seu-cyan" />
    </div>
  </div>

  {/* Tabs - Sticky below header */}
  <div className="sticky top-[140px] z-10 border-b border-gray-200 bg-white">
    <div className="flex gap-1 p-1">
      <button className="flex-1 rounded-lg bg-seu-blue px-4 py-2 font-medium text-white">
        نظرة عامة
      </button>
      <button className="flex-1 rounded-lg px-4 py-2 font-medium text-seu-slate transition-colors hover:bg-gray-50">
        التقدم
      </button>
      <button className="relative flex-1 rounded-lg px-4 py-2 font-medium text-seu-slate transition-colors hover:bg-gray-50">
        الرسائل
        <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-seu-orange" />
      </button>
      <button className="flex-1 rounded-lg px-4 py-2 font-medium text-seu-slate transition-colors hover:bg-gray-50">
        المواد
      </button>
    </div>
  </div>

  {/* Tab Content */}
  <div className="p-6">
    {/* Content here changes without page reload */}
  </div>
</div>
```

---

## ✅ Implementation Guidelines

### **Do:**
✅ Use SEU brand colors for main UI elements
✅ Use gradients for hero/featured elements
✅ Keep IBM Plex Sans Arabic (already perfect)
✅ Use SEU Blue (#0083BE) as primary
✅ Use SEU Cyan (#32B7A8) for success/completion
✅ Use SEU Orange (#FFA300) for warnings/deadlines
✅ Use SEU Navy (#111E4D) for dark text

### **Don't:**
❌ Don't introduce new brand colors
❌ Don't use random blues/greens - stick to SEU palette
❌ Don't change the font (IBM Plex is great)
❌ Don't ignore RTL (direction already set)

---

## 📊 Color Usage Summary Table

| Element | Color | Hex | Use Case |
|---------|-------|-----|----------|
| **Primary Actions** | SEU Blue | `#0083BE` | Buttons, links, active states |
| **Success/Completion** | SEU Cyan | `#32B7A8` | Checkmarks, certificates, completed |
| **Warning/Urgent** | SEU Orange | `#FFA300` | Deadlines, alerts, pending |
| **Accent/Featured** | SEU Purple | `#593888` | Featured content, hover states |
| **Dark Text** | SEU Navy | `#111E4D` | Headings, important text |
| **Body Text** | SEU Slate | `#5A6872` | Paragraphs, descriptions |
| **Borders/Dividers** | SEU Gray | `#D0D3D4` | Subtle borders, dividers |

---

## 🎨 Gradient Combinations

```css
/* Primary Gradient (Blue → Cyan) */
background: linear-gradient(135deg, #0083BE, #32B7A8);

/* Success Gradient (Cyan → Lime) */
background: linear-gradient(135deg, #32B7A8, #C4D600);

/* Featured Gradient (Purple → Blue) */
background: linear-gradient(135deg, #593888, #0083BE);

/* Sidebar Gradient (Blue → Navy) */
background: linear-gradient(180deg, #0083BE, #111E4D);
```

---

**This design system respects your existing SEU branding while applying Uber/Coursera UX patterns!**
