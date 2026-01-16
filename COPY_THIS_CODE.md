# 🚀 **FIXED - COPY THIS INTO DJANGO SHELL**

## ⚡ **STEPS:**

### **1. You already have the shell open, so just copy the code below:**

```python
from apps.schools.models import Classroom, School, AcademicYear, Subject
from apps.accounts.models import User
from datetime import date
import random, string

teacher = User.objects.filter(role='teacher').first()
print(f"Teacher: {teacher.email if teacher else 'NOT FOUND'}")

school, _ = School.objects.get_or_create(code='PREM001', defaults={'name': 'Premium Educational Institute', 'address': '123 Education Street', 'city': 'Knowledge City', 'state': 'Learning State', 'country': 'India', 'pincode': '123456', 'phone': '1234567890', 'email': 'info@premiumedu.com', 'website': 'https://premiumedu.com', 'principal_name': 'Dr. John Smith', 'established_year': 2020})

academic_year, _ = AcademicYear.objects.get_or_create(school=school, name='2024-2025', defaults={'start_date': date(2024, 4, 1), 'end_date': date(2025, 3, 31), 'is_current': True})

subjects_data = [{'name': 'Mathematics', 'code': 'MATH', 'grade': 1}, {'name': 'Science', 'code': 'SCI', 'grade': 1}, {'name': 'English', 'code': 'ENG', 'grade': 1}, {'name': 'Physics', 'code': 'PHY', 'grade': 2}, {'name': 'Chemistry', 'code': 'CHEM', 'grade': 2}, {'name': 'Biology', 'code': 'BIO', 'grade': 2}]

subjects = {}
for data in subjects_data:
    subject, _ = Subject.objects.get_or_create(name=data['name'], grade=data['grade'], defaults={'code': data['code']})
    subjects[data['name']] = subject

classrooms_data = [{'grade': 1, 'section': 'A', 'subject': 'Mathematics'}, {'grade': 1, 'section': 'B', 'subject': 'Science'}, {'grade': 1, 'section': 'C', 'subject': 'English'}, {'grade': 2, 'section': 'A', 'subject': 'Physics'}, {'grade': 2, 'section': 'B', 'subject': 'Chemistry'}, {'grade': 2, 'section': 'C', 'subject': 'Biology'}]

for idx, data in enumerate(classrooms_data):
    class_code = f"{data['subject'][:3].upper()}{data['grade']}{data['section']}-{''.join(random.choices(string.digits, k=4))}"
    classroom, created = Classroom.objects.get_or_create(school=school, academic_year=academic_year, subject=subjects[data['subject']], grade=data['grade'], section=data['section'], defaults={'teacher': teacher, 'room_number': f"Room {101 + idx}", 'max_students': 30, 'class_code': class_code})
    if created:
        print(f"✅ Created: Grade {classroom.grade} - Section {classroom.section} ({classroom.subject.name})")

print(f"\n🎉 Total classrooms: {Classroom.objects.filter(teacher=teacher).count()}")
```

### **2. Press Enter**

### **3. Type `exit()` and press Enter**

### **4. Restart Django server:**
```powershell
python manage.py runserver
```

### **5. Refresh browser (Ctrl+Shift+R)**

### **6. Test:**
Go to `http://localhost:3000/teacher/lectures` → Click "Create Lecture"

---

## ✅ **YOU'LL SEE:**

```
Classroom *
Select a classroom
Mathematics - Grade 1A
Science - Grade 1B
English - Grade 1C
Physics - Grade 2A
Chemistry - Grade 2B
Biology - Grade 2C
```

---

**Just copy the code above and paste it into your Django shell!** 🚀
