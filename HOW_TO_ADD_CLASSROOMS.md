# 📚 **HOW TO ADD CLASSROOMS - STEP BY STEP GUIDE**

## 🎯 **METHOD 1: Django Admin Panel (Easiest)**

### **Step 1: Make sure Django server is running**
```bash
# Activate virtual environment (if not already active)
venv\Scripts\activate

# Run Django server
python manage.py runserver
```

### **Step 2: Access Django Admin**
1. Open browser: `http://localhost:8000/admin`
2. Login with superuser credentials:
   - Username: (your admin username)
   - Password: (your admin password)

### **Step 3: Create a Classroom**
1. Click on **"Schools"** section
2. Click on **"Classrooms"** 
3. Click **"Add Classroom"** button (top right)
4. Fill in the form:
   - **Grade:** e.g., "Grade 10"
   - **Section:** e.g., "Section A"
   - **Subject:** e.g., "Mathematics"
   - **Teacher:** Select your teacher account
   - **Academic Year:** e.g., "2024-2025"
   - **Room Number:** e.g., "101"
   - **Max Students:** e.g., "30"
5. Click **"Save"**

### **Step 4: Verify**
1. Go back to frontend: `http://localhost:3000/teacher/lectures`
2. Click "Create Lecture"
3. You should now see your classroom in the dropdown! ✅

---

## 🎯 **METHOD 2: Django Shell (For Multiple Classrooms)**

### **Step 1: Open Django Shell**
```bash
python manage.py shell
```

### **Step 2: Create Classrooms**
```python
from apps.schools.models import Classroom, School
from apps.accounts.models import User

# Get your teacher user
teacher = User.objects.get(email='teacher@test.com')

# Get or create a school
school, _ = School.objects.get_or_create(
    name='Test School',
    defaults={
        'address': '123 Main St',
        'city': 'Test City',
        'state': 'Test State',
        'country': 'Test Country',
        'phone': '1234567890',
        'email': 'school@test.com'
    }
)

# Create classrooms
classrooms_data = [
    {'grade': 'Grade 10', 'section': 'Section A', 'subject': 'Mathematics'},
    {'grade': 'Grade 10', 'section': 'Section B', 'subject': 'Science'},
    {'grade': 'Grade 11', 'section': 'Section A', 'subject': 'Physics'},
    {'grade': 'Grade 11', 'section': 'Section B', 'subject': 'Chemistry'},
]

for data in classrooms_data:
    Classroom.objects.create(
        school=school,
        teacher=teacher,
        grade=data['grade'],
        section=data['section'],
        subject=data['subject'],
        academic_year='2024-2025',
        room_number='101',
        max_students=30
    )

print("✅ Classrooms created successfully!")
```

### **Step 3: Exit Shell**
```python
exit()
```

---

## 🎯 **METHOD 3: Create Superuser (If You Don't Have One)**

### **Step 1: Create Superuser**
```bash
python manage.py createsuperuser
```

Follow the prompts:
- Username: `admin`
- Email: `admin@test.com`
- Password: `admin123` (or your choice)

### **Step 2: Login to Admin**
Go to `http://localhost:8000/admin` and login

---

## 🎯 **METHOD 4: API Endpoint (For Developers)**

### **Step 1: Use POST Request**
```bash
curl -X POST http://localhost:8000/api/v1/schools/classrooms/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "school": 1,
    "grade": "Grade 10",
    "section": "Section A",
    "subject": "Mathematics",
    "academic_year": "2024-2025",
    "room_number": "101",
    "max_students": 30
  }'
```

---

## ✅ **QUICK START SCRIPT**

Create a file `create_classrooms.py` in the project root:

```python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.schools.models import Classroom, School
from apps.accounts.models import User

# Get teacher
teacher = User.objects.filter(role='teacher').first()

if not teacher:
    print("❌ No teacher found. Please create a teacher account first.")
    exit()

# Get or create school
school, _ = School.objects.get_or_create(
    name='Premium Educational Institute',
    defaults={
        'address': '123 Education Street',
        'city': 'Knowledge City',
        'state': 'Learning State',
        'country': 'Education Country',
        'phone': '1234567890',
        'email': 'info@premiumedu.com'
    }
)

# Create classrooms
classrooms = [
    {'grade': 'Grade 10', 'section': 'A', 'subject': 'Mathematics'},
    {'grade': 'Grade 10', 'section': 'B', 'subject': 'Science'},
    {'grade': 'Grade 10', 'section': 'C', 'subject': 'English'},
    {'grade': 'Grade 11', 'section': 'A', 'subject': 'Physics'},
    {'grade': 'Grade 11', 'section': 'B', 'subject': 'Chemistry'},
    {'grade': 'Grade 11', 'section': 'C', 'subject': 'Biology'},
]

created_count = 0
for data in classrooms:
    classroom, created = Classroom.objects.get_or_create(
        school=school,
        teacher=teacher,
        grade=data['grade'],
        section=data['section'],
        subject=data['subject'],
        defaults={
            'academic_year': '2024-2025',
            'room_number': f"Room {created_count + 101}",
            'max_students': 30
        }
    )
    if created:
        created_count += 1
        print(f"✅ Created: {classroom.grade} - Section {classroom.section} ({classroom.subject})")
    else:
        print(f"⏭️  Already exists: {classroom.grade} - Section {classroom.section} ({classroom.subject})")

print(f"\n🎉 Done! Created {created_count} new classrooms.")
print(f"📊 Total classrooms for {teacher.get_full_name()}: {Classroom.objects.filter(teacher=teacher).count()}")
```

### **Run the script:**
```bash
python create_classrooms.py
```

---

## 🎉 **EXPECTED RESULT**

After creating classrooms, when you:
1. Go to `http://localhost:3000/teacher/lectures`
2. Click "Create Lecture"
3. You'll see in the Classroom dropdown:

```
Select a classroom
Grade 10 - Section A (Mathematics)
Grade 10 - Section B (Science)
Grade 10 - Section C (English)
Grade 11 - Section A (Physics)
Grade 11 - Section B (Chemistry)
Grade 11 - Section C (Biology)
```

---

## 🚀 **RECOMMENDED: Use the Quick Start Script**

It's the fastest way to create multiple classrooms at once!

```bash
# 1. Create the script file
# (Copy the script above to create_classrooms.py)

# 2. Run it
python create_classrooms.py

# 3. Refresh your browser
# 4. Create a lecture - classrooms will appear!
```

---

**Choose Method 1 (Django Admin) if you want a GUI, or use the Quick Start Script for speed!** 🚀
