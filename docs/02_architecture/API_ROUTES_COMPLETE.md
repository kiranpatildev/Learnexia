# 🚀 **COMPLETE API ROUTES - BACKEND**

## 📍 **BASE URL**
```
http://localhost:8000/api/v1/
```

---

## 🔐 **1. AUTHENTICATION & ACCOUNTS**

### **Base Path:** `/api/v1/accounts/`

#### **Register**
```
POST /api/v1/accounts/register/
Headers: None
Request: {
  email: "string",
  password: "string",
  first_name: "string",
  last_name: "string",
  role: "student" | "teacher" | "parent"
}
Response: {
  id: number,
  email: "string",
  first_name: "string",
  last_name: "string",
  role: "string",
  date_joined: "datetime"
}
Status: 201 Created
```

#### **Login (Get Tokens)**
```
POST /api/v1/accounts/login/
Headers: None
Request: {
  email: "string",
  password: "string"
}
Response: {
  access: "jwt_access_token",
  refresh: "jwt_refresh_token"
}
Status: 200 OK
```

#### **Refresh Token**
```
POST /api/v1/accounts/token/refresh/
Headers: None
Request: {
  refresh: "jwt_refresh_token"
}
Response: {
  access: "new_jwt_access_token"
}
Status: 200 OK
```

#### **Get Current User**
```
GET /api/v1/accounts/users/me/
Headers: {
  Authorization: "Bearer <access_token>"
}
Response: {
  id: number,
  email: "string",
  first_name: "string",
  last_name: "string",
  role: "student" | "teacher" | "parent",
  is_active: boolean,
  date_joined: "datetime"
}
Status: 200 OK
```

#### **List Users**
```
GET /api/v1/accounts/users/
Headers: {
  Authorization: "Bearer <access_token>"
}
Query Params: {
  role?: "student" | "teacher" | "parent",
  search?: "string",
  page?: number
}
Response: {
  count: number,
  next: "url" | null,
  previous: "url" | null,
  results: [User]
}
Status: 200 OK
```

#### **Get User by ID**
```
GET /api/v1/accounts/users/{id}/
Headers: {
  Authorization: "Bearer <access_token>"
}
Response: User
Status: 200 OK
```

#### **Update User**
```
PATCH /api/v1/accounts/users/{id}/
Headers: {
  Authorization: "Bearer <access_token>"
}
Request: {
  first_name?: "string",
  last_name?: "string",
  email?: "string"
}
Response: User
Status: 200 OK
```

---

## 🏫 **2. SCHOOLS**

### **Base Path:** `/api/v1/schools/`

#### **List Schools**
```
GET /api/v1/schools/
Headers: {
  Authorization: "Bearer <access_token>"
}
Response: {
  count: number,
  results: [School]
}
```

#### **Create School**
```
POST /api/v1/schools/
Headers: {
  Authorization: "Bearer <access_token>"
}
Request: {
  name: "string",
  address: "string",
  contact_email: "string",
  contact_phone: "string"
}
Response: School
Status: 201 Created
```

#### **List Classes**
```
GET /api/v1/schools/classes/
Headers: {
  Authorization: "Bearer <access_token>"
}
Query Params: {
  school?: number,
  teacher?: number,
  grade_level?: "string"
}
Response: {
  count: number,
  results: [Class]
}
```

#### **Create Class**
```
POST /api/v1/schools/classes/
Headers: {
  Authorization: "Bearer <access_token>"
}
Request: {
  name: "string",
  grade_level: "string",
  school: number,
  teacher: number
}
Response: Class
Status: 201 Created
```

---

## 🎓 **3. LECTURES**

### **Base Path:** `/api/v1/lectures/`

#### **List Lectures**
```
GET /api/v1/lectures/
Headers: {
  Authorization: "Bearer <access_token>"
}
Query Params: {
  class_id?: number,
  teacher?: number,
  date_from?: "YYYY-MM-DD",
  date_to?: "YYYY-MM-DD",
  transcript_approved?: boolean
}
Response: {
  count: number,
  next: "url" | null,
  previous: "url" | null,
  results: [Lecture]
}
```

#### **Create Lecture**
```
POST /api/v1/lectures/
Headers: {
  Authorization: "Bearer <access_token>"
}
Request: {
  title: "string",
  class_id: number,
  date: "YYYY-MM-DD",
  duration: number,
  transcript: "text"
}
Response: Lecture
Status: 201 Created
```

#### **Get Lecture**
```
GET /api/v1/lectures/{id}/
Headers: {
  Authorization: "Bearer <access_token>"
}
Response: Lecture
```

#### **Update Lecture**
```
PATCH /api/v1/lectures/{id}/
Headers: {
  Authorization: "Bearer <access_token>"
}
Request: {
  title?: "string",
  transcript?: "text",
  duration?: number
}
Response: Lecture
```

#### **Delete Lecture**
```
DELETE /api/v1/lectures/{id}/
Headers: {
  Authorization: "Bearer <access_token>"
}
Status: 204 No Content
```

#### **Approve Transcript**
```
POST /api/v1/lectures/{id}/approve_transcript/
Headers: {
  Authorization: "Bearer <access_token>"
}
Response: {
  message: "Transcript approved successfully",
  lecture: Lecture
}
Status: 200 OK
```

---

## 📝 **4. AI FEATURES - NOTES**

### **Base Path:** `/api/v1/lectures/{lecture_id}/`

#### **Generate Notes**
```
POST /api/v1/lectures/{id}/generate_notes/
Headers: {
  Authorization: "Bearer <access_token>"
}
Request: {
  note_format: "comprehensive" | "bullet_point" | "cornell" | "study_guide",
  force_regenerate: boolean,
  auto_publish: boolean
}
Response: {
  id: number,
  lecture: number,
  note_format: "string",
  content: "text",
  word_count: number,
  generated_at: "datetime",
  published: boolean,
  cost_usd: number
}
Status: 200 OK
```

#### **List Notes**
```
GET /api/v1/notes/
Headers: {
  Authorization: "Bearer <access_token>"
}
Query Params: {
  lecture?: number,
  note_format?: "string",
  published?: boolean
}
Response: {
  count: number,
  results: [LectureNote]
}
```

#### **Get Note**
```
GET /api/v1/notes/{id}/
Headers: {
  Authorization: "Bearer <access_token>"
}
Response: LectureNote
```

---

## 📋 **5. AI FEATURES - QUIZZES**

#### **Generate Quiz**
```
POST /api/v1/lectures/{id}/generate_quiz/
Headers: {
  Authorization: "Bearer <access_token>"
}
Request: {
  difficulty: "EASY" | "MEDIUM" | "HARD",
  length: 5 | 10 | 15,
  force_regenerate: boolean,
  auto_publish: boolean
}
Response: {
  id: number,
  lecture: number,
  title: "string",
  difficulty: "string",
  question_count: number,
  questions: [
    {
      question: "string",
      options: ["string"],
      correct_answer: "string",
      explanation: "string"
    }
  ],
  published: boolean,
  cost_usd: number
}
Status: 200 OK
```

#### **List Quizzes**
```
GET /api/v1/quizzes/
Headers: {
  Authorization: "Bearer <access_token>"
}
Query Params: {
  lecture?: number,
  difficulty?: "EASY" | "MEDIUM" | "HARD",
  published?: boolean
}
Response: {
  count: number,
  results: [Quiz]
}
```

#### **Get Quiz**
```
GET /api/v1/quizzes/{id}/
Headers: {
  Authorization: "Bearer <access_token>"
}
Response: Quiz
```

#### **Submit Quiz**
```
POST /api/v1/quizzes/{id}/submit/
Headers: {
  Authorization: "Bearer <access_token>"
}
Request: {
  answers: [
    {
      question_id: number,
      answer: "string"
    }
  ]
}
Response: {
  score: number,
  total_questions: number,
  correct_answers: number,
  results: [
    {
      question_id: number,
      correct: boolean,
      user_answer: "string",
      correct_answer: "string"
    }
  ]
}
```

---

## 🗂️ **6. AI FEATURES - FLASHCARDS**

#### **Generate Flashcards**
```
POST /api/v1/lectures/{id}/generate_flashcards/
Headers: {
  Authorization: "Bearer <access_token>"
}
Request: {
  card_type: "DEFINITION" | "CONCEPT" | "EXAMPLE" | "APPLICATION" | "MIXED",
  style: "CONCISE" | "DETAILED",
  count: "auto" | number
}
Response: {
  count: number,
  flashcards: [
    {
      id: number,
      front: "string",
      back: "string",
      card_type: "string",
      difficulty: "EASY" | "MEDIUM" | "HARD"
    }
  ],
  cost_usd: number
}
Status: 200 OK
```

#### **List Flashcards**
```
GET /api/v1/flashcards/
Headers: {
  Authorization: "Bearer <access_token>"
}
Query Params: {
  lecture?: number,
  card_type?: "string"
}
Response: {
  count: number,
  results: [Flashcard]
}
```

---

## 👥 **7. AI FEATURES - BEHAVIOR DETECTION**

#### **Detect Behaviors**
```
POST /api/v1/lectures/{id}/detect_behaviors/
Headers: {
  Authorization: "Bearer <access_token>"
}
Request: {
  sensitivity: "LOW" | "MEDIUM" | "HIGH"
}
Response: {
  detected_count: number,
  message: "Detected X behavior events. Pending teacher review."
}
Status: 200 OK
```

#### **List Pending Detections**
```
GET /api/v1/behavior/pending-detections/
Headers: {
  Authorization: "Bearer <access_token>"
}
Response: {
  count: number,
  results: [
    {
      id: number,
      lecture: number,
      student_name: "string",
      behavior_type: "DISTURBANCE" | "DISRESPECT" | "TARDINESS" | "INCOMPLETE_WORK" | "POSITIVE" | "PARTICIPATION" | "OTHER",
      severity: "LOW" | "MEDIUM" | "HIGH",
      description: "text",
      status: "pending" | "approved" | "rejected",
      ai_confidence: number
    }
  ]
}
```

#### **Review Detection**
```
POST /api/v1/behavior/pending-detections/{id}/review/
Headers: {
  Authorization: "Bearer <access_token>"
}
Request: {
  action: "APPROVE" | "MODIFY" | "REJECT",
  teacher_notes: "string",
  send_to_student: boolean,
  send_to_parent: boolean,
  modified_data?: {
    behavior_type: "string",
    severity: "string",
    description: "text"
  }
}
Response: {
  message: "Action successful",
  incident?: BehaviorIncident
}
Status: 200 OK
```

#### **List Behavior Incidents**
```
GET /api/v1/behavior/incidents/
Headers: {
  Authorization: "Bearer <access_token>"
}
Query Params: {
  student?: number,
  lecture?: number,
  behavior_type?: "string",
  severity?: "LOW" | "MEDIUM" | "HIGH",
  is_positive?: boolean
}
Response: {
  count: number,
  results: [BehaviorIncident]
}
```

---

## 📚 **8. ASSESSMENTS (ASSIGNMENTS)**

### **Base Path:** `/api/v1/assessments/`

#### **List Assignments**
```
GET /api/v1/assessments/assignments/
Headers: {
  Authorization: "Bearer <access_token>"
}
Query Params: {
  class_id?: number,
  status?: "pending" | "submitted" | "graded",
  due_date_from?: "YYYY-MM-DD",
  due_date_to?: "YYYY-MM-DD"
}
Response: {
  count: number,
  results: [Assignment]
}
```

#### **Create Assignment**
```
POST /api/v1/assessments/assignments/
Headers: {
  Authorization: "Bearer <access_token>"
}
Request: {
  title: "string",
  description: "text",
  class_id: number,
  due_date: "YYYY-MM-DD",
  max_score: number,
  assignment_type: "homework" | "project" | "essay"
}
Response: Assignment
Status: 201 Created
```

#### **Get Assignment**
```
GET /api/v1/assessments/assignments/{id}/
Headers: {
  Authorization: "Bearer <access_token>"
}
Response: Assignment
```

#### **Submit Assignment**
```
POST /api/v1/assessments/assignments/{id}/submit/
Headers: {
  Authorization: "Bearer <access_token>",
  Content-Type: "multipart/form-data"
}
Request: {
  file: File,
  notes: "string"
}
Response: {
  id: number,
  assignment: number,
  student: number,
  submitted_at: "datetime",
  file_url: "string",
  status: "submitted"
}
Status: 201 Created
```

#### **Grade Assignment**
```
POST /api/v1/assessments/assignments/{id}/grade/
Headers: {
  Authorization: "Bearer <access_token>"
}
Request: {
  submission_id: number,
  score: number,
  feedback: "text"
}
Response: {
  submission: Submission,
  score: number,
  feedback: "text",
  graded_at: "datetime"
}
```

---

## 📅 **9. ATTENDANCE**

### **Base Path:** `/api/v1/attendance/`

#### **List Attendance Records**
```
GET /api/v1/attendance/records/
Headers: {
  Authorization: "Bearer <access_token>"
}
Query Params: {
  student?: number,
  class_id?: number,
  date_from?: "YYYY-MM-DD",
  date_to?: "YYYY-MM-DD",
  status?: "present" | "absent" | "late" | "excused"
}
Response: {
  count: number,
  results: [AttendanceRecord]
}
```

#### **Mark Attendance**
```
POST /api/v1/attendance/records/
Headers: {
  Authorization: "Bearer <access_token>"
}
Request: {
  student: number,
  class_id: number,
  date: "YYYY-MM-DD",
  status: "present" | "absent" | "late" | "excused",
  notes: "string"
}
Response: AttendanceRecord
Status: 201 Created
```

#### **Get Attendance Statistics**
```
GET /api/v1/attendance/statistics/
Headers: {
  Authorization: "Bearer <access_token>"
}
Query Params: {
  student?: number,
  class_id?: number,
  date_from?: "YYYY-MM-DD",
  date_to?: "YYYY-MM-DD"
}
Response: {
  total_days: number,
  present: number,
  absent: number,
  late: number,
  excused: number,
  attendance_rate: number
}
```

---

## 💬 **10. COMMUNICATION**

### **Base Path:** `/api/v1/communication/`

#### **List Messages**
```
GET /api/v1/communication/messages/
Headers: {
  Authorization: "Bearer <access_token>"
}
Query Params: {
  sender?: number,
  recipient?: number,
  unread?: boolean
}
Response: {
  count: number,
  results: [Message]
}
```

#### **Send Message**
```
POST /api/v1/communication/messages/
Headers: {
  Authorization: "Bearer <access_token>"
}
Request: {
  recipient: number,
  subject: "string",
  body: "text"
}
Response: Message
Status: 201 Created
```

#### **Mark as Read**
```
POST /api/v1/communication/messages/{id}/mark_read/
Headers: {
  Authorization: "Bearer <access_token>"
}
Response: {
  message: "Message marked as read"
}
```

---

## 🔔 **11. NOTIFICATIONS**

### **Base Path:** `/api/v1/notifications/`

#### **List Notifications**
```
GET /api/v1/notifications/
Headers: {
  Authorization: "Bearer <access_token>"
}
Query Params: {
  unread?: boolean,
  notification_type?: "string"
}
Response: {
  count: number,
  results: [Notification]
}
```

#### **Mark as Read**
```
POST /api/v1/notifications/{id}/mark_read/
Headers: {
  Authorization: "Bearer <access_token>"
}
Response: {
  message: "Notification marked as read"
}
```

#### **Mark All as Read**
```
POST /api/v1/notifications/mark_all_read/
Headers: {
  Authorization: "Bearer <access_token>"
}
Response: {
  message: "All notifications marked as read",
  count: number
}
```

---

## 📊 **12. REPORTS**

### **Base Path:** `/api/v1/reports/`

#### **Generate Student Report**
```
POST /api/v1/reports/student/
Headers: {
  Authorization: "Bearer <access_token>"
}
Request: {
  student_id: number,
  date_from: "YYYY-MM-DD",
  date_to: "YYYY-MM-DD",
  include_attendance: boolean,
  include_grades: boolean,
  include_behavior: boolean
}
Response: {
  report_id: number,
  status: "generating" | "ready",
  download_url: "string"
}
```

#### **Download Report**
```
GET /api/v1/reports/{id}/download/
Headers: {
  Authorization: "Bearer <access_token>"
}
Response: PDF File
```

---

## 🎯 **SUMMARY**

### **Total Endpoints:** ~80+

### **By Category:**
- **Authentication:** 6 endpoints
- **Users:** 4 endpoints
- **Schools & Classes:** 6 endpoints
- **Lectures:** 6 endpoints
- **AI Notes:** 3 endpoints
- **AI Quizzes:** 4 endpoints
- **AI Flashcards:** 2 endpoints
- **AI Behavior:** 4 endpoints
- **Assignments:** 5 endpoints
- **Attendance:** 3 endpoints
- **Communication:** 3 endpoints
- **Notifications:** 3 endpoints
- **Reports:** 2 endpoints

---

## 🔐 **AUTHENTICATION**

All endpoints except `/register/` and `/login/` require:
```
Headers: {
  Authorization: "Bearer <access_token>"
}
```

---

## 📝 **RESPONSE FORMATS**

### **Success:**
```json
{
  "data": {},
  "message": "Success"
}
```

### **Error:**
```json
{
  "error": "Error message",
  "detail": "Detailed error description"
}
```

### **Validation Error:**
```json
{
  "field_name": ["Error message"]
}
```

---

## 🚀 **TESTING**

### **Swagger UI:**
```
http://localhost:8000/swagger/
```

### **ReDoc:**
```
http://localhost:8000/redoc/
```

---

**This is your complete API documentation!** 📚
