# Add this to lectures/views.py after the generate_flashcards method

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def generate_quiz(self, request, pk=None):
        """
        Generate AI-powered quiz from approved lecture transcript
        
        Endpoint: POST /api/v1/lectures/{id}/generate_quiz/
        
        Request Body:
        {
            "difficulty": "EASY" | "MEDIUM" | "HARD",
            "length": 5 | 10 | 15
        }
        
        Response (Success):
        {
            "success": true,
            "message": "Quiz generated successfully!",
            "quiz_id": "uuid",
            "questions": [...],
            "count": 10
        }
        """
        from apps.assessments.ai_services.quiz_generator import QuizGeneratorService
        from apps.assessments.models import Quiz, Question, QuestionOption
        from django.utils import timezone
        import logging
        
        logger = logging.getLogger(__name__)
        
        lecture = self.get_object()
        
        # Validate permissions
        if lecture.teacher != request.user:
            return Response(
                {
                    'success': False,
                    'message': 'You can only generate quizzes for your own lectures',
                    'error_code': 'PERMISSION_DENIED'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get parameters
        difficulty = request.data.get('difficulty', 'MEDIUM')
        length = request.data.get('length', 10)
        
        # Validate parameters
        if difficulty not in ['EASY', 'MEDIUM', 'HARD']:
            return Response(
                {
                    'success': False,
                    'message': 'Invalid difficulty. Must be EASY, MEDIUM, or HARD',
                    'error_code': 'INVALID_DIFFICULTY'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if length not in [5, 10, 15]:
            return Response(
                {
                    'success': False,
                    'message': 'Invalid length. Must be 5, 10, or 15',
                    'error_code': 'INVALID_LENGTH'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f"Generating {difficulty} quiz ({length} questions) for lecture: {lecture.title}")
        
        # Generate quiz using AI service
        try:
            service = QuizGeneratorService()
            result = service.generate_quiz(
                lecture=lecture,
                difficulty=difficulty,
                length=length
            )
            
            if not result['success']:
                return Response(
                    {
                        'success': False,
                        'message': result.get('error', 'Failed to generate quiz'),
                        'error_code': 'GENERATION_FAILED'
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            logger.info(f"✅ Quiz generated for lecture {lecture.id}: {result['count']} questions ({difficulty})")
            
            # Save quiz to database
            quiz = Quiz.objects.create(
                classroom=lecture.classroom,
                teacher=request.user,
                title=f"{lecture.title} - Quiz",
                description=f"AI-generated {difficulty.lower()} quiz with {length} questions",
                difficulty_level=difficulty.lower(),
                total_points=length * 10,  # 10 points per question
                time_limit=length * 2,  # 2 minutes per question
                is_published=True,  # Auto-publish
                is_ai_generated=True,
                ai_generated_at=timezone.now()
            )
            
            # Create questions
            for idx, q_data in enumerate(result['questions'], start=1):
                question = Question.objects.create(
                    quiz=quiz,
                    question_type='mcq',
                    question_text=q_data['question'],
                    explanation=q_data.get('explanation', ''),
                    points=10,
                    order=idx,
                    is_ai_generated=True
                )
                
                # Create options
                for opt_idx, option_text in enumerate(q_data['options'], start=1):
                    QuestionOption.objects.create(
                        question=question,
                        option_text=option_text,
                        is_correct=(option_text == q_data['correct_answer']),
                        order=opt_idx
                    )
            
            logger.info(f"✅ Saved {result['count']} questions to database (Quiz ID: {quiz.id})")
            logger.info(f"✅ Quiz published and available to students")
            
            # Return success response
            return Response({
                'success': True,
                'message': f'{result["count"]} question quiz generated successfully!\n\nDifficulty: {difficulty}\nThe quiz has been published and is now available to students.',
                'quiz_id': str(quiz.id),
                'questions': result['questions'],
                'count': result['count'],
                'difficulty': difficulty
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            logger.error(f"Quiz generation error: {str(e)}", exc_info=True)
            return Response(
                {
                    'success': False,
                    'message': f'An error occurred while generating quiz: {str(e)}',
                    'error_code': 'GENERATION_ERROR'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
