# 📚 **HOW TO CREATE TEST DATA - COMPLETE GUIDE**

## 🎯 **OVERVIEW**

To see data in your Teacher pages, you need to create lectures, assignments, quizzes, etc. Here are all the ways to do it:

---

## 🔧 **METHOD 1: Django Shell (Recommended for Testing)**

### **Step 1: Open Django Shell**

```bash
python manage.py shell
```

### **Step 2: Create a Lecture**

```python
from apps.lectures.models import Lecture
from apps.schools.models import Class, School
from apps.accounts.models import User

# Get the teacher user
teacher = User.objects.filter(role='teacher').first()

# Create school if it doesn't exist
school, created = School.objects.get_or_create(
    name="Test School",
    defaults={
        'address': "123 Main St",
        'contact_email': "school@test.com",
        'contact_phone': "123-456-7890"
    }
)

# Create class if it doesn't exist
cls, created = Class.objects.get_or_create(
    name="Grade 4A",
    defaults={
        'grade_level': "4",
        'school': school,
        'teacher': teacher
    }
)

# Create a lecture
lecture = Lecture.objects.create(
    title="Introduction to Photosynthesis",
    class_id=cls,
    teacher=teacher,
    date="2026-01-15",
    duration=50,
    transcript="""
    Good morning class! Today we're going to learn about photosynthesis.
    Photosynthesis is the process by which plants use sunlight to convert 
    carbon dioxide and water into glucose and oxygen. This is one of the 
    most important processes on Earth because it provides food for plants 
    and oxygen for us to breathe. The process happens in the chloroplasts 
    of plant cells, which contain a green pigment called chlorophyll.
    Let's break down the equation: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2.
    This means six molecules of carbon dioxide plus six molecules of water,
    with the help of light energy, produce one molecule of glucose and six
    molecules of oxygen.
    """,
    transcript_approved_by_teacher=True
)

print(f"✅ Created lecture: {lecture.title}")
print(f"   ID: {lecture.id}")
print(f"   Class: {cls.name}")
print(f"   Transcript approved: {lecture.transcript_approved_by_teacher}")
```

### **Step 3: Create More Lectures (Optional)**

```python
# Create another lecture
lecture2 = Lecture.objects.create(
    title="The Water Cycle",
    class_id=cls,
    teacher=teacher,
    date="2026-01-14",
    duration=45,
    transcript="""
    Hello everyone! Today's lesson is about the water cycle. The water cycle
    is the continuous movement of water on, above, and below the surface of
    the Earth. It involves four main stages: evaporation, condensation,
    precipitation, and collection. When the sun heats up water in rivers,
    lakes, or the ocean, it turns into vapor or steam. This is evaporation.
    The water vapor rises into the air and cools down, forming clouds. This
    is condensation. When the clouds get heavy, the water falls back to Earth
    as rain, snow, sleet, or hail. This is precipitation. The water then
    collects in rivers, lakes, and oceans, and the cycle starts again.
    """,
    transcript_approved_by_teacher=True
)

print(f"✅ Created lecture: {lecture2.title}")
```

### **Step 4: Exit Shell**

```python
exit()
```

---

## 🌐 **METHOD 2: Django Admin**

### **Step 1: Access Django Admin**

Go to: `http://localhost:8000/admin/`

### **Step 2: Login**

Use your superuser credentials (or create one with `python manage.py createsuperuser`)

### **Step 3: Create Data**

1. Click on **"Lectures"** under the Lectures app
2. Click **"Add Lecture"**
3. Fill in the form:
   - Title: "Introduction to Algebra"
   - Class: Select a class
   - Teacher: Select teacher
   - Date: Today's date
   - Duration: 50
   - Transcript: Paste some text
   - Check "Transcript approved by teacher"
4. Click **"Save"**

---

## 📡 **METHOD 3: API Endpoint (Using Postman/Thunder Client)**

### **Step 1: Get Auth Token**

**POST** `http://localhost:8000/api/v1/accounts/login/`

**Body:**
```json
{
  "email": "teacher@test.com",
  "password": "test123"
}
```

**Response:** Copy the `access` token

### **Step 2: Create Lecture**

**POST** `http://localhost:8000/api/v1/lectures/`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Introduction to Photosynthesis",
  "class_id": 1,
  "date": "2026-01-15",
  "duration": 50,
  "transcript": "Today we're learning about photosynthesis...",
  "transcript_approved_by_teacher": true
}
```

---

## 🎓 **QUICK TEST DATA SCRIPT**

Save this as `create_test_data.py` in your project root:

```python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.lectures.models import Lecture
from apps.schools.models import Class, School
from apps.accounts.models import User

def create_test_data():
    # Get teacher
    teacher = User.objects.filter(role='teacher').first()
    if not teacher:
        print("❌ No teacher found. Create a teacher user first.")
        return

    # Create school
    school, _ = School.objects.get_or_create(
        name="Test School",
        defaults={
            'address': "123 Main St",
            'contact_email': "school@test.com",
            'contact_phone': "123-456-7890"
        }
    )

    # Create class
    cls, _ = Class.objects.get_or_create(
        name="Grade 4A",
        defaults={
            'grade_level': "4",
            'school': school,
            'teacher': teacher
        }
    )

    # Create lectures
    lectures_data = [
        {
            'title': 'Introduction to Photosynthesis',
            'transcript': 'Photosynthesis is the process by which plants...'
        },
        {
            'title': 'The Water Cycle',
            'transcript': 'The water cycle is the continuous movement...'
        },
        {
            'title': 'Introduction to Algebra',
            'transcript': 'Algebra is a branch of mathematics...'
        }
    ]

    for data in lectures_data:
        lecture, created = Lecture.objects.get_or_create(
            title=data['title'],
            defaults={
                'class_id': cls,
                'teacher': teacher,
                'date': '2026-01-15',
                'duration': 50,
                'transcript': data['transcript'],
                'transcript_approved_by_teacher': True
            }
        )
        if created:
            print(f"✅ Created: {lecture.title}")
        else:
            print(f"ℹ️  Already exists: {lecture.title}")

if __name__ == '__main__':
    create_test_data()
    print("\n🎉 Test data creation complete!")
```

**Run it:**
```bash
python create_test_data.py
```

---

## ✅ **VERIFY DATA WAS CREATED**

### **Check in Django Shell:**
```python
python manage.py shell
```

```python
from apps.lectures.models import Lecture
lectures = Lecture.objects.all()
print(f"Total lectures: {lectures.count()}")
for lecture in lectures:
    print(f"  - {lecture.title}")
```

### **Check in Frontend:**
1. Refresh browser
2. Go to `/teacher/lectures`
3. You should see your lectures!

---

## 🎯 **WHAT HAPPENS NEXT**

Once you create lectures with approved transcripts:

1. **Lectures Page** - Will show your lectures
2. **AI Features** - You can select lectures and generate:
   - Notes (4 formats)
   - Quizzes (3 difficulties)
   - Flashcards (4 types)
   - Behavior detection
3. **Student Pages** - Students can see the generated content

---

## 🚀 **RECOMMENDED WORKFLOW**

1. ✅ Create lectures (use Django shell script above)
2. ✅ Login as teacher
3. ✅ Go to AI Features
4. ✅ Select a lecture
5. ✅ Generate notes/quizzes/flashcards
6. ✅ Login as student
7. ✅ View the generated content!

---

**Use the Django Shell method (Method 1) - it's the fastest!** 🎉
