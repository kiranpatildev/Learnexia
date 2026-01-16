# 🔍 **DEBUGGING 400 ERROR - STEP BY STEP**

## ⚠️ **CURRENT ISSUE**
Getting 400 Bad Request when creating lecture

## 🔧 **DEBUGGING STEPS**

### **Step 1: Check if classrooms exist**

Open Django shell:
```bash
python manage.py shell
```

Run:
```python
from apps.schools.models import Classroom
from apps.accounts.models import User

teacher = User.objects.filter(role='teacher').first()
classrooms = Classroom.objects.filter(teacher=teacher)

print(f"Teacher: {teacher.email}")
print(f"Classrooms count: {classrooms.count()}")

for c in classrooms:
    print(f"ID: {c.id}, Grade: {c.grade}, Section: {c.section}, Subject: {c.subject.name}")
```

### **Step 2: Check what the frontend is sending**

Open browser console (F12) and look at the Network tab when you click "Create Lecture".

Look for the POST request to `/api/v1/lectures/lectures/` and check the Request Payload.

### **Step 3: Check Django server logs**

Look at the terminal where `python manage.py runserver` is running.

You should see the error details there.

### **Step 4: Test API directly**

In Django shell:
```python
from apps.lectures.models import Lecture
from apps.schools.models import Classroom
from apps.accounts.models import User

teacher = User.objects.filter(role='teacher').first()
classroom = Classroom.objects.filter(teacher=teacher).first()

# Try to create a lecture
lecture = Lecture.objects.create(
    classroom=classroom,
    teacher=teacher,
    title="Test Lecture",
    chapter="Test Chapter",
    topic="Test Topic",
    description="Test Description",
    duration=2700,  # 45 minutes in seconds
    transcript="Test transcript",
    recording_type='audio',
    status='completed',
    transcript_approved_by_teacher=True,
    is_shared_with_students=True
)

print(f"✅ Lecture created: {lecture.id}")
```

If this works, the issue is in the frontend data format.

If this fails, the issue is in the model/database.

---

## 🎯 **MOST LIKELY ISSUES**

### **Issue 1: Classroom ID doesn't exist**
The frontend might be sending a classroom ID that doesn't exist in the database.

**Fix:** Make sure you're selecting a classroom from the dropdown.

### **Issue 2: Field validation error**
Some field might have invalid data.

**Fix:** Check the Django server logs for the exact error message.

### **Issue 3: Missing required field**
We might be missing a required field.

**Fix:** Check the model for all required fields (fields without `null=True` or `blank=True`).

---

## 🚀 **QUICK FIX TO TRY**

### **Option 1: Check browser console**

1. Open browser (F12)
2. Go to Console tab
3. Try to create a lecture
4. Look for error messages
5. Copy the error and share it

### **Option 2: Check Django logs**

1. Look at the terminal where Django is running
2. Try to create a lecture
3. Look for error messages in red
4. Copy the error and share it

---

**Run Step 1 first to verify classrooms exist!** 🔍
