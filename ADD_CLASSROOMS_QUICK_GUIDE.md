# 🎯 **HOW TO ADD CLASSROOMS - QUICK GUIDE**

## ⚠️ **PROBLEM**
You see: "⚠️ No classrooms found. Please contact your administrator."

This means the teacher account has no classrooms assigned yet.

---

## ✅ **SOLUTION: Run the Script**

### **Method 1: Double-Click the Batch File (Easiest)**

1. **Find the file:** `create_classrooms.bat`
2. **Double-click it**
3. **Wait for it to complete**
4. **You'll see:**
   ```
   ✅ Created: Grade 10 - Section A (Mathematics)
   ✅ Created: Grade 10 - Section B (Science)
   ✅ Created: Grade 10 - Section C (English)
   ...
   🎉 Done! Created 8 new classrooms
   ```

### **Method 2: Run from Command Line**

```bash
# Make sure you're in the project directory
cd c:\Users\HOME\Desktop\premium_edu_platform

# Run the batch file
create_classrooms.bat
```

### **Method 3: Manual Python Command**

```bash
# Activate virtual environment
venv\Scripts\activate

# Run the script
python create_classrooms.py
```

---

## 📊 **WHAT GETS CREATED**

The script creates 8 classrooms:

| Grade | Section | Subject |
|---|---|---|
| Grade 10 | A | Mathematics |
| Grade 10 | B | Science |
| Grade 10 | C | English |
| Grade 11 | A | Physics |
| Grade 11 | B | Chemistry |
| Grade 11 | C | Biology |
| Grade 12 | A | Computer Science |
| Grade 12 | B | History |

---

## 🚀 **AFTER RUNNING THE SCRIPT**

1. **Refresh your browser** (Ctrl + Shift + R)
2. **Go to:** `http://localhost:3000/teacher/lectures`
3. **Click "Create Lecture"**
4. **You'll now see the classroom dropdown populated!**

```
Classroom *
Select a classroom
Grade 10 - A (Mathematics)
Grade 10 - B (Science)
Grade 10 - C (English)
Grade 11 - A (Physics)
Grade 11 - B (Chemistry)
Grade 11 - C (Biology)
Grade 12 - A (Computer Science)
Grade 12 - B (History)
```

---

## 🎉 **THAT'S IT!**

**Just run `create_classrooms.bat` and you're done!** 🚀

The classrooms will be created and you can start creating lectures immediately!

---

## 🔧 **ALTERNATIVE: Django Admin**

If you prefer a GUI:

1. Go to: `http://localhost:8000/admin`
2. Login with admin credentials
3. Click **"Schools"** → **"Classrooms"**
4. Click **"Add Classroom"**
5. Fill in the form and save

---

## ❓ **TROUBLESHOOTING**

### **"No teacher found"**
Create a teacher account first:
```bash
python manage.py createsuperuser
```

### **"Module not found"**
Activate virtual environment:
```bash
venv\Scripts\activate
```

### **Script doesn't run**
Make sure Django server is NOT running in the same terminal.

---

**Run `create_classrooms.bat` now!** 🚀
