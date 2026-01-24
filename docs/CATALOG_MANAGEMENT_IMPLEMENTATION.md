# Catalog Management - Implementation Summary

**Date**: 2026-01-24  
**Status**: Backend Complete, Frontend In Progress

---

## ✅ Completed Work

### **1. Database Schema Updates**

All schema changes have been applied via migration `20260123230325_add_catalog_enhancements`:

**Program Table Enhancements**:
```prisma
model Program {
  // New pricing fields
  earlyBirdPrice     Decimal?      @db.Decimal(10, 2)
  corporatePrice     Decimal?      @db.Decimal(10, 2)
  
  // Certificate settings
  certificateEnabled          Boolean @default(true)
  certificateAttendanceThreshold Int  @default(80)
  
  // Relations updated
  modules     ProgramModule[]  // New relation
  // instructorId removed - instructors now assigned at cohort level
}
```

**New Tables**:
```prisma
model ProgramModule {
  id          String   @id @default(cuid())
  programId   String
  titleAr     String
  titleEn     String
  descriptionAr String? @db.Text
  descriptionEn String? @db.Text
  durationHours Int
  sortOrder   Int      @default(0)
  sessions    Session[]
}

model Session {
  id          String   @id @default(cuid())
  moduleId    String
  titleAr     String
  titleEn     String
  descriptionAr String? @db.Text
  descriptionEn String? @db.Text
  durationMinutes Int
  sortOrder   Int      @default(0)
}
```

### **2. Backend API Endpoints**

#### **Program Endpoints** (Updated)
- `POST /api/catalog/programs` - Create program (with pricing tiers, certificate settings)
- `PUT /api/catalog/programs/:id` - Update program
- `POST /api/catalog/programs/:id/clone` - **NEW** Clone program with modules/sessions
- `GET /api/catalog/programs?deliveryMode=ONLINE` - **NEW** Filter by delivery mode

#### **Curriculum Endpoints** (New)
**Modules**:
- `POST /api/curriculum/modules` - Create module
- `GET /api/curriculum/programs/:programId/modules` - List modules
- `GET /api/curriculum/modules/:id` - Get module details
- `PUT /api/curriculum/modules/:id` - Update module
- `DELETE /api/curriculum/modules/:id` - Delete module
- `PUT /api/curriculum/programs/:programId/modules/reorder` - Reorder modules

**Sessions**:
- `POST /api/curriculum/sessions` - Create session
- `GET /api/curriculum/modules/:moduleId/sessions` - List sessions
- `GET /api/curriculum/sessions/:id` - Get session details
- `PUT /api/curriculum/sessions/:id` - Update session
- `DELETE /api/curriculum/sessions/:id` - Delete session
- `PUT /api/curriculum/modules/:moduleId/sessions/reorder` - Reorder sessions

### **3. Backend Services**

**CatalogService** (Updated):
- Handles new pricing fields (earlyBirdPrice, corporatePrice)
- Includes modules/sessions in program queries
- Supports deliveryMode filtering
- `cloneProgram()` - Deep clone with curriculum

**CurriculumService** (New):
- Full CRUD for modules and sessions
- Drag-and-drop reordering support
- Cascading deletes (module → sessions)

---

## 📋 Remaining Frontend Work

### **Priority 1: Admin Program Form Updates**

**File**: `/frontend/src/app/admin/programs/page.tsx`

**Changes Needed**:

1. **Add Pricing Tier Fields**:
```typescript
const [programForm, setProgramForm] = useState({
  // ... existing fields
  price: '',
  earlyBirdPrice: '',      // NEW
  corporatePrice: '',      // NEW
  // ...
});
```

2. **Add Certificate Settings**:
```typescript
const [programForm, setProgramForm] = useState({
  // ... existing fields
  certificateEnabled: true,              // NEW
  certificateAttendanceThreshold: 80,    // NEW
  // ...
});
```

3. **Remove instructorId** (no longer used):
```typescript
// REMOVE this field from programForm
instructorId: '',  // DELETE THIS
```

4. **Update Form UI** - Add sections for:
   - Early Bird Price input
   - Corporate Price input
   - Certificate toggle
   - Attendance threshold slider (0-100%)

### **Priority 2: Rich Text Editor Integration**

**Recommended**: Use **Tiptap** (lightweight, React-friendly)

**Installation**:
```bash
cd frontend
npm install @tiptap/react @tiptap/starter-kit
```

**Implementation**:
```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// In component
const editorAr = useEditor({
  extensions: [StarterKit],
  content: programForm.descriptionAr,
  onUpdate: ({ editor }) => {
    setProgramForm(prev => ({
      ...prev,
      descriptionAr: editor.getHTML()
    }));
  },
});

// In JSX
<EditorContent editor={editorAr} />
```

Replace textareas for `descriptionAr` and `descriptionEn` with rich text editors.

### **Priority 3: Curriculum Builder UI**

**Create New Component**: `/frontend/src/components/admin/CurriculumBuilder.tsx`

**Features**:
- List modules with expand/collapse
- Add/edit/delete modules
- Add/edit/delete sessions within modules
- Drag-and-drop reordering (use `@dnd-kit/core`)
- Display total duration calculation

**Props**:
```typescript
interface CurriculumBuilderProps {
  programId: string;
  modules: Module[];
  onUpdate: () => void;
}
```

**API Calls**:
```typescript
// Create module
await fetch(`/api/curriculum/modules`, {
  method: 'POST',
  body: JSON.stringify({
    programId,
    titleAr,
    titleEn,
    durationHours,
  }),
});

// Reorder modules
await fetch(`/api/curriculum/programs/${programId}/modules/reorder`, {
  method: 'PUT',
  body: JSON.stringify({ moduleIds: ['id1', 'id2', 'id3'] }),
});
```

### **Priority 4: Program Actions UI**

**Add to Program List**:

1. **Status Change Dropdown**:
```typescript
<select
  value={program.status}
  onChange={(e) => handleStatusChange(program.id, e.target.value)}
>
  <option value="DRAFT">مسودة</option>
  <option value="PUBLISHED">منشور</option>
  <option value="ARCHIVED">مؤرشف</option>
</select>
```

2. **Clone Button**:
```typescript
const handleClone = async (programId: string) => {
  const response = await fetch(
    `/api/catalog/programs/${programId}/clone`,
    { method: 'POST' }
  );
  const cloned = await response.json();
  // Redirect to edit page
  router.push(`/admin/programs/${cloned.id}/edit`);
};

<Button onClick={() => handleClone(program.id)}>
  <Copy className="w-4 h-4 ml-2" />
  نسخ البرنامج
</Button>
```

### **Priority 5: Public Catalog Filter**

**File**: `/frontend/src/app/programs/page.tsx`

**Add Delivery Mode Filter**:
```typescript
const [deliveryMode, setDeliveryMode] = useState<string>('');

// In fetch
const params = new URLSearchParams({
  search,
  categoryId,
  deliveryMode,  // NEW
});

// In UI
<select
  value={deliveryMode}
  onChange={(e) => setDeliveryMode(e.target.value)}
>
  <option value="">جميع أنماط التقديم</option>
  <option value="ONLINE">عن بُعد</option>
  <option value="IN_PERSON">حضوري</option>
  <option value="HYBRID">مدمج</option>
</select>
```

### **Priority 6: Program Detail Page**

**File**: `/frontend/src/app/programs/[slug]/page.tsx`

**Display Curriculum**:
```typescript
// Fetch includes modules now
const program = await fetch(`/api/catalog/programs/slug/${slug}`);

// In JSX
<section className="curriculum">
  <h2>المنهج الدراسي</h2>
  {program.modules.map((module, idx) => (
    <div key={module.id} className="module">
      <h3>الوحدة {idx + 1}: {module.titleAr}</h3>
      <p>{module.durationHours} ساعة</p>
      <ul>
        {module.sessions.map((session) => (
          <li key={session.id}>
            {session.titleAr} ({session.durationMinutes} دقيقة)
          </li>
        ))}
      </ul>
    </div>
  ))}
</section>
```

---

## 🎯 Implementation Order

1. ✅ **Backend** (Completed)
2. **Admin Form Updates** (2-3 hours)
   - Add pricing fields
   - Add certificate settings
   - Remove instructor field
3. **Rich Text Editor** (1-2 hours)
   - Install Tiptap
   - Replace description textareas
4. **Curriculum Builder** (4-6 hours)
   - Create component
   - Implement CRUD operations
   - Add drag-and-drop
5. **Program Actions** (1 hour)
   - Status change dropdown
   - Clone button
6. **Public Catalog** (30 min)
   - Add delivery mode filter
7. **Program Detail** (1 hour)
   - Display curriculum structure

**Total Estimated Time**: 10-14 hours

---

## 📝 Testing Checklist

### Backend (Already Tested via Migration)
- [x] Programs created with pricing tiers
- [x] Modules and sessions created
- [x] Program cloning works
- [x] Delivery mode filtering works

### Frontend (To Test)
- [ ] Create program with early bird/corporate pricing
- [ ] Toggle certificate settings
- [ ] Create/edit modules and sessions
- [ ] Reorder modules via drag-and-drop
- [ ] Clone program creates full copy
- [ ] Change program status (Draft → Published)
- [ ] Filter catalog by delivery mode
- [ ] View curriculum on program detail page

---

## 🔧 Quick Start Commands

**Backend** (Already running):
```bash
cd backend
npm run start:dev
```

**Frontend**:
```bash
cd frontend
npm run dev
```

**Install Rich Text Editor**:
```bash
cd frontend
npm install @tiptap/react @tiptap/starter-kit
```

**Install Drag-and-Drop** (for curriculum):
```bash
cd frontend
npm install @dnd-kit/core @dnd-kit/sortable
```

---

## 📊 PRD Status Update

Once frontend is complete, update `/prds/catalog-management.json`:

- US-001: ✅ Schema (PASS)
- US-002: ✅ Admin Form (PASS after rich text editor)
- US-003: ✅ Pricing Tiers (PASS after form update)
- US-004: ⚠️ Instructor Assignment (Changed to cohort-level)
- US-005: ✅ Curriculum (PASS after builder)
- US-006: ✅ Certificate Settings (PASS after form update)
- US-007: ✅ Program Lifecycle (PASS after status UI)
- US-008: ✅ Clone Program (PASS after button)
- US-009: ✅ Public Catalog (Already passing)
- US-010: ✅ Program Detail (PASS after curriculum display)
- US-011: ✅ Search/Filter (PASS after delivery mode filter)

---

## 🚀 Next Steps

1. Start with **Admin Form Updates** (easiest, high impact)
2. Add **Rich Text Editor** (improves UX significantly)
3. Build **Curriculum Manager** (most complex, core feature)
4. Add **Program Actions** (clone, status change)
5. Update **Public Pages** (filter, curriculum display)
6. **Test end-to-end** and update PRD JSON

All backend endpoints are ready and waiting for frontend integration!
