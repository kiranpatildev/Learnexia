# 🚀 **EXACT COMMANDS TO CREATE CLASSROOMS**

## ⚡ **COPY AND PASTE THESE COMMANDS**

### **Option 1: PowerShell (What you're using now)**

```powershell
# Stop the Django server first (Ctrl+C in that terminal)
# Then run these commands in the Django terminal:

python create_classrooms.py
```

### **Option 2: Use Django Shell (Recommended)**

```powershell
# In your Django terminal (where manage.py runserver is):
# Press Ctrl+C to stop the server
# Then run:

python manage.py shell
```

Then paste this code:

```python
from apps.schools.models import Classroom, School
from apps.accounts.models import User

# Get teacher
teacher = User.objects.filter(role='teacher').first()
print(f"Teacher: {teacher.email if teacher else 'NOT FOUND'}")

# Create school
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
classrooms_data = [
    {'grade': 'Grade 10', 'section': 'A', 'subject': 'Mathematics'},
    {'grade': 'Grade 10', 'section': 'B', 'subject': 'Science'},
    {'grade': 'Grade 10', 'section': 'C', 'subject': 'English'},
    {'grade': 'Grade 11', 'section': 'A', 'subject': 'Physics'},
    {'grade': 'Grade 11', 'section': 'B', 'subject': 'Chemistry'},
    {'grade': 'Grade 11', 'section': 'C', 'subject': 'Biology'},
]

for idx, data in enumerate(classrooms_data):
    classroom, created = Classroom.objects.get_or_create(
        school=school,
        teacher=teacher,
        grade=data['grade'],
        section=data['section'],
        subject=data['subject'],
        defaults={
            'academic_year': '2024-2025',
            'room_number': f"Room {101 + idx}",
            'max_students': 30,
            'is_active': True
        }
    )
    if created:
        print(f"✅ Created: {classroom.grade} - Section {classroom.section} ({classroom.subject})")
    else:
        print(f"⏭️  Exists: {classroom.grade} - Section {classroom.section} ({classroom.subject})")

print(f"\n🎉 Total classrooms: {Classroom.objects.filter(teacher=teacher).count()}")
```

Then type:
```python
exit()
```

Then restart the server:
```powershell
python manage.py runserver
```

---

## 🎯 **STEP-BY-STEP INSTRUCTIONS**

### **Step 1: Stop Django Server**
In the terminal where Django is running, press **Ctrl+C**

### **Step 2: Open Django Shell**
```powershell
python manage.py shell
```

### **Step 3: Copy the Python Code Above**
Copy everything from `from apps.schools.models...` to `print(f"\n🎉 Total classrooms...`

### **Step 4: Paste into Shell**
Right-click in the terminal to paste

### **Step 5: Press Enter**
The code will run and create classrooms

### **Step 6: Exit Shell**
```python
exit()
```

### **Step 7: Restart Server**
```powershell
python manage.py runserver
```

### **Step 8: Refresh Browser**
Press **Ctrl + Shift + R** in your browser

### **Step 9: Test**
Go to `http://localhost:3000/teacher/lectures` → Click "Create Lecture"

You should now see classrooms in the dropdown! ✅

---

## 🎉 **THAT'S IT!**

The classrooms will be created and you can start creating lectures!
