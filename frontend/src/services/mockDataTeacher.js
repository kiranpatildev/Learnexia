export const mockTeacher = {
    id: "teacher-001",
    first_name: "Sarah",
    last_name: "Johnson",
    name: "Sarah Johnson",
    email: "sarah.johnson@school.com",
    phone: "+1234567890",
    employee_id: "EMP-2024-001",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    specialization: "Mathematics",
    school_name: "Springfield Elementary",
    department: "Mathematics Department",
    years_experience: 8,
    member_since: "2018-08-01",
    classes_count: 1,
    total_students: 30
};

export const mockDashboardStats = {
    pending_grading: 5,
    todays_classes: 3,
    at_risk_students: 4,
    unread_messages: 8
};

export const mockAssignments = [
    {
        id: "assign-001",
        title: "Math Practice Problems",
        subject: "Mathematics",
        due_date: "2025-01-20",
        total_points: 100,
        total_students: 30,
        submitted: 25,
        pending_grading: 5,
        graded: 20,
        priority: "Urgent"
    },
    {
        id: "assign-002",
        title: "Science Project",
        subject: "Science",
        due_date: "2025-01-25",
        total_points: 50,
        total_students: 30,
        submitted: 28,
        pending_grading: 0,
        graded: 28,
        priority: "Normal"
    }
];

export const mockSubmissions = [
    {
        id: "sub-001",
        assignment_id: "assign-001",
        student: {
            id: "s1",
            name: "Josh Anderson",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Josh"
        },
        submitted_at: "2025-01-16T14:30:00Z",
        is_late: false,
        status: "submitted",
        submission_text: "Here are my answers to problems 1-10...",
        files: [
            { id: "f1", name: "homework.pdf", type: "pdf", size: 2048000 }
        ],
        ai_suggested_score: 85,
        ai_feedback: "Good work overall. Minor calculation error in problem 7.",
        ai_confidence: 0.87,
        points_earned: null,
        feedback: null
    },
    {
        id: "sub-002",
        assignment_id: "assign-001",
        student: {
            id: "s2",
            name: "Emma Wilson",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma"
        },
        submitted_at: "2025-01-15T10:00:00Z",
        is_late: false,
        status: "graded",
        submission_text: "Attached is my work.",
        files: [],
        ai_suggested_score: 95,
        ai_feedback: "Excellent work!",
        ai_confidence: 0.95,
        points_earned: 95,
        feedback: "Great job Emma!"
    }
];

export const mockLeaderboard = [
    {
        rank: 1,
        student: { id: "s1", name: "Emma Wilson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
        xp: 3200,
        level: 14,
        rank_change: 0
    },
    {
        rank: 2,
        student: { id: "s2", name: "Josh Anderson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Josh" },
        xp: 2850,
        level: 12,
        rank_change: 1
    },
    {
        rank: 3,
        student: { id: "s3", name: "Liam Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam" },
        xp: 2700,
        level: 11,
        rank_change: -1
    }
];

export const mockIncidents = [
    {
        id: "inc-001",
        student: { id: "s1", name: "Josh Anderson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Josh" },
        title: "Late to Class",
        type: "Late",
        severity: "Minor",
        date: "2025-01-15",
        description: "Student arrived 15 minutes late",
        action_taken: "Verbal warning",
        resolved: false,
        parent_notified: false
    }
];

export const mockConversations = [
    {
        id: "conv-001",
        student: { id: "s1", name: "Josh Anderson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Josh" },
        lastMessage: "Thank you for the feedback!",
        lastMessageTime: "2025-01-16T14:30:00Z",
        unread: 0,
        messages: [
            { id: "m1", sender: "teacher", text: "Great work!", time: "2025-01-16T10:00:00Z" },
            { id: "m2", sender: "student", text: "Thank you for the feedback!", time: "2025-01-16T14:30:00Z" }
        ]
    }
];

export const mockLectures = [
    {
        id: "lec-001",
        title: "Introduction to Fractions",
        duration: "45:00",
        date: "2025-02-01",
        views: 28,
        thumbnail: "https://picsum.photos/seed/math1/300/200",
        transcript_status: "Ready",
        subject: "Mathematics"
    }
];

export const mockNotes = [
    {
        id: "note-001",
        title: "Fractions Summary",
        summary: "Key concepts about numerators and denominators.",
        chapter: "Chapter 5",
        views: 15,
        downloads: 5,
        bookmarks: 2,
        published: true,
        is_ai_generated: true
    }
];

export const mockFlashcardSets = [
    {
        id: "fc-001",
        title: "Fractions Terminology",
        description: "Basic terms for fractions unit",
        total_cards: 20,
        study_count: 45,
        mastery: 75,
        published: true,
        is_ai_generated: true
    }
];

export const mockQuizzes = [
    {
        id: "quiz-001",
        title: "Fractions Basics Quiz",
        total_questions: 10,
        difficulty: "Medium",
        is_ai_generated: true,
        completed: 25,
        total_students: 30,
        avg_score: 82
    }
];

export const mockActivityLog = [
    {
        id: "log-1",
        type: "graded",
        description: "Graded Assignment",
        detail: "Math Practice Problems (Josh A.)",
        timestamp: "2025-01-16T15:00:00Z"
    },
    {
        id: "log-2",
        type: "created",
        description: "Created Quiz",
        detail: "Fractions Basics Quiz",
        timestamp: "2025-01-15T10:00:00Z"
    }
];

export const mockStudents = [
    { id: "s1", name: "Josh Anderson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Josh", performance: 85, grade: "B+" },
    { id: "s2", name: "Emma Wilson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", performance: 95, grade: "A" },
    { id: "s3", name: "Liam Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam", performance: 88, grade: "A-" },
    { id: "s4", name: "Olivia Davis", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia", performance: 78, grade: "C+" },
    { id: "s5", name: "Noah Brown", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Noah", performance: 92, grade: "A-" }
];
