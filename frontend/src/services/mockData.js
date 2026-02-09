
export const mockUser = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Rahul Sharma",
    first_name: "Rahul",
    last_name: "Sharma",
    email: "rahul@example.com",
    phone: "+1234567890",
    date_of_birth: "2010-05-15",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
    role: "student",
    grade: 5,
    section: "A",
    school_name: "Springfield Elementary",
    member_since: "2024-01-01",
    current_streak: 0,
    longest_streak: 7,
    total_xp: 20,
    current_level: 1,
    xp_to_next_level: 100,
    guardian_name: "Sarah Sharma",
    guardian_phone: "+1234567891",
    guardian_email: "sarah@example.com",
    emergency_contact_name: "Michael Sharma",
    emergency_contact_phone: "+1234567892",
    emergency_contact_relationship: "Father"
};

export const mockAssignments = []; // 0 pending

export const mockAttendance = [
    // Mocking 92% attendance for the month
    // 23 present, 2 absent = 25 total. 23/25 = 92%
    ...Array(23).fill({ date: "2026-02-01", subject: "Math", status: "present", session_type: "Morning" }),
    ...Array(2).fill({ date: "2026-02-02", subject: "Science", status: "absent", session_type: "Morning" })
];

export const mockQuizzes = {
    total: 28,
    completed: 20,
    remaining: 8,
    average: 85,
    attempts: [
        {
            id: "1",
            title: "Math Lecture",
            subject: "Mathematics",
            topic: "Integration",
            due_date: "Jan 16",
            status: "Completed",
            score: 92,
            difficulty: "medium"
        },
        {
            id: "2",
            title: "Science Lecture",
            subject: "Science",
            topic: "Newtons laws",
            due_date: "Jan 16",
            status: "Unfinished",
            difficulty: "easy"
        },
        {
            id: "3",
            title: "Math Lecture",
            subject: "English",
            topic: "Letter writing",
            due_date: "Jan 16",
            status: "Completed",
            score: 88,
            difficulty: "medium"
        }
    ]
};

export const mockGrades = {
    overall_percentage: 86,
    gpa: 3.6,
    class_rank: 5,
    total_students: 30,
    subjects: [
        { subject: "Mathematics", percentage: 92, grade: "A", comments: "Excellent work!" },
        { subject: "Science", percentage: 85, grade: "B+", comments: "Good understanding" },
        { subject: "English", percentage: 78, grade: "B", comments: "Needs improvement in essays" }
    ],
    trend_data: [
        { month: "Sep", score: 75 },
        { month: "Oct", score: 80 },
        { month: "Nov", score: 83 },
        { month: "Dec", score: 86 },
        { month: "Jan", score: 86 }
    ]
};

export const mockLeaderboard = [
    { rank: 1, username: "Emma Wilson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", score: 3200, rank_change: 2 },
    { rank: 2, username: "James Lee", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James", score: 2850, rank_change: 0 },
    { rank: 3, username: "Alex Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", score: 2650, rank_change: -1 },
    { rank: 4, username: "Sophia Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia", score: 2500, rank_change: 1 },
    { rank: 5, username: "Josh Anderson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Josh", score: 2850, rank_change: 3 },
    { rank: 6, username: "Maya Patel", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya", score: 2200, rank_change: -2 },
    { rank: 7, username: "Ryan Kim", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan", score: 2100, rank_change: 0 },
    { rank: 8, username: "Olivia Brown", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia", score: 2000, rank_change: 1 },
    { rank: 9, username: "Ethan Davis", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan", score: 1950, rank_change: -1 },
    { rank: 10, username: "Isabella Garcia", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella", score: 1900, rank_change: 0 }
];

export const mockNotes = [
    {
        id: "1",
        title: "Introduction to Fractions",
        subject: "Mathematics",
        chapter: "Chapter 5",
        topic: "Basic Fractions",
        teacher_name: "Ms. Johnson",
        date_added: "2025-01-10",
        is_ai_generated: true,
        pdf_url: "/notes/fractions.pdf"
    },
    {
        id: "2",
        title: "Water Cycle Explained",
        subject: "Science",
        chapter: "Chapter 3",
        topic: "The Water Cycle",
        teacher_name: "Mr. Davis",
        date_added: "2025-01-08",
        is_ai_generated: false,
        pdf_url: "/notes/water-cycle.pdf"
    },
    {
        id: "3",
        title: "Essay Writing Basics",
        subject: "English",
        chapter: "Chapter 7",
        topic: "Persuasive Essays",
        teacher_name: "Mrs. Smith",
        date_added: "2025-01-05",
        is_ai_generated: true,
        pdf_url: "/notes/essay-writing.pdf"
    }
];

export const mockFlashcardSets = [
    {
        id: "1",
        title: "Math Vocabulary",
        subject: "Mathematics",
        total_cards: 20,
        cards_studied: 15,
        mastery_percentage: 75
    },
    {
        id: "2",
        title: "Science Terms",
        subject: "Science",
        total_cards: 25,
        cards_studied: 10,
        mastery_percentage: 40
    }
];

export const mockFlashcards = [
    {
        id: "1",
        set_id: "1",
        question: "What is a fraction?",
        answer: "A part of a whole, expressed as numerator/denominator",
        hint: "Think about pizza slices",
        confidence_level: "medium",
        times_studied: 3
    },
    {
        id: "2",
        set_id: "1",
        question: "What is a numerator?",
        answer: "The top number in a fraction that shows how many parts you have",
        hint: "It's on top",
        confidence_level: "easy",
        times_studied: 5
    },
    {
        id: "3",
        set_id: "2",
        question: "What is photosynthesis?",
        answer: "The process by which plants make their own food using sunlight",
        hint: "Plants and sunlight",
        confidence_level: "hard",
        times_studied: 1
    }
];

export const mockBadges = [
    {
        id: "1",
        name: "First Steps",
        icon: "🏆",
        description: "Complete your first lecture",
        category: "Academic",
        rarity: "common",
        xp_reward: 10,
        earned_date: "2026-02-01",
        is_locked: false
    },
    {
        id: "2",
        name: "On Fire!",
        icon: "🔥",
        description: "7 day learning streak",
        category: "Behavior",
        rarity: "rare",
        xp_reward: 50,
        earned_date: "2026-02-08",
        is_locked: false
    },
    {
        id: "3",
        name: "Rising Star",
        icon: "⭐",
        description: "Score 90% or higher on a quiz",
        category: "Academic",
        rarity: "epic",
        xp_reward: 100,
        earned_date: null,
        is_locked: true
    }
];

export const mockBehavior = {
    current_score: 95,
    trend: "improving",
    class_average: 88,
    total_incidents: 2,
    positive_behaviors: [
        {
            id: "1",
            title: "Class Helper",
            date: "2025-01-10",
            description: "Helped classmates understand fractions",
            points_earned: 10
        },
        {
            id: "2",
            title: "Homework Streak",
            date: "2025-01-05",
            description: "Completed 10 assignments in a row on time",
            points_earned: 25
        },
        {
            id: "3",
            title: "Excellent Participation",
            date: "2024-12-20",
            description: "Active participation in Science class discussion",
            points_earned: 15
        }
    ],
    parent_notifications: 1,
    days_since_last_incident: 45,
    incidents: [
        {
            id: "1",
            title: "Late to Class",
            type: "Late",
            severity: "Minor",
            incident_date: "2024-12-01",
            description: "Arrived 5 minutes late to Mathematics class",
            resolved: true,
            parent_notified: true,
            resolution_notes: "Student apologized and explained valid reason"
        },
        {
            id: "2",
            title: "Forgot Homework",
            type: "Other",
            severity: "Minor",
            incident_date: "2024-11-15",
            description: "Did not submit Science homework on time",
            resolved: true,
            parent_notified: false,
            resolution_notes: "Submitted the next day"
        }
    ],
    behavior_trend: [
        { month: "Aug", score: 85 },
        { month: "Sep", score: 88 },
        { month: "Oct", score: 90 },
        { month: "Nov", score: 92 },
        { month: "Dec", score: 93 },
        { month: "Jan", score: 95 }
    ]
};

export const mockSettings = {
    notifications: {
        email: true,
        assignments: true,
        grades: true,
        behavior: true,
        announcements: false
    },
    quiet_hours_start: "22:00",
    quiet_hours_end: "07:00",
    theme: "auto",
    privacy: {
        show_profile: true,
        show_badges: true,
        show_rank: true,
        parent_can_view_activity: true
    }
};

export const mockActivityLog = [
    {
        id: "1",
        type: "login",
        description: "Logged in from Chrome on Windows",
        timestamp: "2025-01-16T14:30:00Z",
        icon: "LogIn"
    },
    {
        id: "2",
        type: "submission",
        description: "Submitted 'Math Practice Problems'",
        timestamp: "2025-01-16T13:45:00Z",
        icon: "FileText"
    },
    {
        id: "3",
        type: "quiz",
        description: "Completed 'Chapter 5 Quiz' with score 92%",
        timestamp: "2025-01-16T11:20:00Z",
        icon: "CheckCircle"
    },
    {
        id: "4",
        type: "notes",
        description: "Viewed notes 'Introduction to Fractions'",
        timestamp: "2025-01-16T09:15:00Z",
        icon: "BookOpen"
    },
    {
        id: "5",
        type: "login",
        description: "Logged in from Mobile Safari on iOS",
        timestamp: "2025-01-15T16:00:00Z",
        icon: "LogIn"
    }
];

// Helper function to get attendance statistics
export const getAttendanceStats = () => {
    const total = mockAttendance.length;
    const present = mockAttendance.filter(a => a.status === 'present').length;
    const absent = mockAttendance.filter(a => a.status === 'absent').length;
    const late = mockAttendance.filter(a => a.status === 'late').length;
    const excused = mockAttendance.filter(a => a.status === 'excused').length;

    return {
        total,
        present,
        absent,
        late,
        excused,
        percentage: Math.round((present / total) * 100)
    };
};
