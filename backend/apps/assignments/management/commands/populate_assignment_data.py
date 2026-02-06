"""
Management command to populate test data for assignments
Run with: python manage.py populate_assignment_data
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from apps.lectures.models import Lecture
from apps.assignments.models import Assignment, AssignmentQuestion
from apps.schools.models import Classroom
from apps.accounts.models import User


class Command(BaseCommand):
    help = 'Populate test data for assignments system'

    def handle(self, *args, **options):
        self.stdout.write("=" * 70)
        self.stdout.write(self.style.SUCCESS(" ASSIGNMENT SYSTEM - DATA POPULATION"))
        self.stdout.write("=" * 70)

        # Check existing data
        self.stdout.write("\n📊 Current Data Status:")
        self.stdout.write(f"   Lectures: {Lecture.objects.count()}")
        self.stdout.write(f"   Lectures with transcripts: {Lecture.objects.exclude(transcript='').count()}")
        self.stdout.write(f"   Assignments: {Assignment.objects.count()}")
        self.stdout.write(f"   Teachers: {User.objects.filter(role='teacher').count()}")
        self.stdout.write(f"   Classrooms: {Classroom.objects.count()}")

        # Get teacher and classroom
        teacher = User.objects.filter(role='teacher').first()
        classroom = Classroom.objects.first()

        if not teacher:
            self.stdout.write(self.style.ERROR("\n❌ ERROR: No teacher found!"))
            self.stdout.write("   Create a teacher user first.")
            return

        if not classroom:
            self.stdout.write(self.style.ERROR("\n❌ ERROR: No classroom found!"))
            self.stdout.write("   Create a classroom first.")
            return

        self.stdout.write(self.style.SUCCESS(f"\n✅ Using Teacher: {teacher.get_full_name()} ({teacher.email})"))
        self.stdout.write(self.style.SUCCESS(f"✅ Using Classroom: {classroom}"))

        # Create lecture with transcript if none exist
        lectures_with_transcripts = Lecture.objects.exclude(transcript='').count()

        if lectures_with_transcripts == 0:
            self.stdout.write("\n📝 Creating lecture with transcript...")
            
            lecture = Lecture.objects.create(
                classroom=classroom,
                teacher=teacher,
                title="Introduction to Internet of Things (IoT)",
                description="Comprehensive introduction to IoT fundamentals, architecture, and applications",
                chapter="Chapter 1: IoT Basics",
                topic="IoT Fundamentals",
                recording_type='audio',
                status='completed',
                transcript="""Welcome to today's comprehensive lecture on the Internet of Things.

The Internet of Things, commonly abbreviated as IoT, represents a revolutionary paradigm in technology where everyday physical objects are connected to the internet, enabling them to send and receive data. This connectivity transforms ordinary devices into smart devices capable of autonomous operation and intelligent decision-making.

Let's explore the fundamental architecture of IoT systems. At the base level, we have sensors and actuators. Sensors collect data from the physical environment - temperature, humidity, motion, light, and countless other parameters. Actuators, on the other hand, perform actions based on processed data, such as turning on lights or adjusting thermostats.

The second layer is connectivity. IoT devices use various communication protocols including WiFi, Bluetooth, Zigbee, LoRaWAN, and cellular networks. The choice of protocol depends on factors like range, power consumption, and data transmission requirements.

Data processing forms the third layer. Raw sensor data is processed either at the edge (on the device itself) or in the cloud. Edge computing reduces latency and bandwidth usage, while cloud processing offers more computational power for complex analytics.

The user interface layer allows humans to interact with IoT systems through mobile apps, web dashboards, or voice assistants. This layer presents processed data in meaningful ways and enables users to control devices remotely.

Real-world applications of IoT are transforming multiple sectors. In smart homes, IoT enables automated lighting, climate control, security systems, and energy management. Wearable devices track health metrics and fitness data. Connected vehicles provide real-time navigation, predictive maintenance, and enhanced safety features.

Smart cities leverage IoT for traffic management, waste management, environmental monitoring, and public safety. Industrial IoT revolutionizes manufacturing through predictive maintenance, supply chain optimization, and quality control automation.

However, IoT also presents significant challenges. Security is paramount as IoT devices often collect sensitive personal data and can serve as entry points for cyberattacks. Common vulnerabilities include weak default passwords, lack of encryption, and infrequent security updates.

Best practices for IoT security include implementing strong authentication mechanisms, encrypting data in transit and at rest, regular firmware updates, network segmentation, and following the principle of least privilege.

Privacy concerns arise from the vast amount of data collected by IoT devices. Regulations like GDPR mandate transparent data collection practices and user consent. Organizations must implement privacy-by-design principles in their IoT solutions.

Looking ahead, emerging trends include edge AI for real-time decision making, 5G networks enabling faster and more reliable connectivity, digital twins for simulation and optimization, and blockchain for secure device authentication and data integrity.

In our next session, we'll dive into hands-on IoT development using popular platforms like Arduino, Raspberry Pi, and ESP32. We'll build practical projects including temperature monitoring systems, smart lighting, and home automation solutions.

Thank you for your attention. Please review the supplementary materials and prepare for our practical lab session next week.""",
                transcript_status='completed',
                has_auto_generated_transcript=False,
                is_shared_with_students=True,
                duration=1800  # 30 minutes
            )
            
            self.stdout.write(self.style.SUCCESS(f"   ✅ Created: {lecture.title}"))
            self.stdout.write(f"   📝 Transcript: {len(lecture.transcript)} characters")
            self.stdout.write(f"   🆔 ID: {lecture.id}")
        else:
            self.stdout.write(self.style.SUCCESS(f"\n✅ {lectures_with_transcripts} lecture(s) with transcripts already exist"))
            for lec in Lecture.objects.exclude(transcript='')[:3]:
                self.stdout.write(f"   - {lec.title} ({len(lec.transcript)} chars)")

        # Create test assignment if none exist
        if Assignment.objects.count() == 0:
            self.stdout.write("\n📋 Creating test assignment...")
            
            assignment = Assignment.objects.create(
                title="IoT Fundamentals Assessment",
                description="Test your understanding of Internet of Things concepts covered in the lecture",
                created_by=teacher,
                classroom=classroom,
                submission_type='online',
                difficulty='medium',
                assignment_format='short_answer',
                total_marks=10,
                pass_marks=6,
                grading_method='ai_assisted',
                due_date=timezone.now() + timedelta(days=7),
                is_published=True,
                published_at=timezone.now()
            )
            
            # Create questions
            questions = [
                ("What does IoT stand for and what is its primary purpose in modern technology?", 2),
                ("List and explain three key components of an IoT system architecture.", 3),
                ("Describe two real-world applications of IoT technology and their benefits.", 2),
                ("What are the main security concerns in IoT and how can they be addressed?", 3)
            ]
            
            for i, (text, marks) in enumerate(questions, 1):
                AssignmentQuestion.objects.create(
                    assignment=assignment,
                    question_number=i,
                    question_text=text,
                    marks=marks
                )
            
            self.stdout.write(self.style.SUCCESS(f"   ✅ Created: {assignment.title}"))
            self.stdout.write(f"   📝 Questions: {assignment.questions.count()}")
            self.stdout.write(f"   🆔 ID: {assignment.id}")
            self.stdout.write(f"   📅 Due: {assignment.due_date.strftime('%Y-%m-%d %H:%M')}")
        else:
            self.stdout.write(self.style.SUCCESS(f"\n✅ {Assignment.objects.count()} assignment(s) already exist"))
            for assgn in Assignment.objects.all()[:3]:
                self.stdout.write(f"   - {assgn.title} ({assgn.questions.count()} questions)")

        # Final status
        self.stdout.write("\n" + "=" * 70)
        self.stdout.write(self.style.SUCCESS(" ✅ DATA POPULATION COMPLETE!"))
        self.stdout.write("=" * 70)
        self.stdout.write("\n📊 Final Data Status:")
        self.stdout.write(f"   Lectures: {Lecture.objects.count()}")
        self.stdout.write(f"   Lectures with transcripts: {Lecture.objects.exclude(transcript='').count()}")
        self.stdout.write(f"   Assignments: {Assignment.objects.count()}")
        self.stdout.write(f"   Assignment Questions: {AssignmentQuestion.objects.count()}")

        self.stdout.write("\n🎉 You can now:")
        self.stdout.write("   1. Refresh the Teacher Assignments page (Ctrl+Shift+R)")
        self.stdout.write("   2. Click 'Generate with AI' to see lectures with transcripts")
        self.stdout.write("   3. View existing assignments in the list")
        self.stdout.write("   4. Test the AI assignment generation feature")

        self.stdout.write("\n💡 Next Steps:")
        self.stdout.write("   - Create student users to test submissions")
        self.stdout.write("   - Test AI grading with sample submissions")
        self.stdout.write("   - Try batch grading feature")
        self.stdout.write("\n")
