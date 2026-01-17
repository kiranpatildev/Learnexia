# 🚀 LECTURE TRANSCRIPTION - SETUP GUIDE

## **Quick Start Guide**

Follow these steps to set up and test the lecture transcription feature.

---

## 📋 **Prerequisites**

1. **Python 3.10+** installed
2. **Redis** installed and running
3. **FFmpeg** installed (for video processing)
4. **OpenAI API Key** (get from https://platform.openai.com/api-keys)

---

## 🔧 **Step 1: Install Dependencies**

```bash
# Install Python packages
pip install -r requirements.txt
```

**New packages installed:**
- `openai==1.6.1` - OpenAI Whisper API
- `assemblyai==0.17.0` - AssemblyAI (backup)
- `ffmpeg-python==0.2.0` - Video processing
- `pydub==0.25.1` - Audio manipulation

---

## 🔑 **Step 2: Configure Environment**

### **Update `.env` file:**

```bash
# Add these lines to your .env file

# AI Services Configuration
AI_TRANSCRIPTION_PROVIDER=whisper
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
OPENAI_ORG_ID=  # Optional
ASSEMBLYAI_API_KEY=  # Optional backup

# Redis (for Celery)
REDIS_URL=redis://localhost:6379/0
```

### **Get OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy and paste into `.env`

**Important:** Set billing limits in OpenAI dashboard to avoid surprises!

---

## 🎬 **Step 3: Install FFmpeg**

FFmpeg is required for extracting audio from video files.

### **Windows:**
1. Download from https://ffmpeg.org/download.html
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to PATH
4. Verify: `ffmpeg -version`

### **Mac:**
```bash
brew install ffmpeg
```

### **Linux:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

---

## 🔴 **Step 4: Start Redis**

Redis is required for Celery (async tasks).

### **Windows:**
1. Download Redis from https://github.com/microsoftarchive/redis/releases
2. Run `redis-server.exe`

### **Mac/Linux:**
```bash
redis-server
```

**Verify Redis is running:**
```bash
redis-cli ping
# Should return: PONG
```

---

## 🐝 **Step 5: Start Celery Worker**

Open a **new terminal** and run:

```bash
# Activate virtual environment first
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Mac/Linux

# Start Celery worker
celery -A config worker -l info --pool=solo
```

**Note:** Use `--pool=solo` on Windows.

**You should see:**
```
[tasks]
  . apps.lectures.tasks.transcribe_lecture_async
```

**Keep this terminal running!**

---

## 🚀 **Step 6: Start Django Server**

Open **another terminal** and run:

```bash
# Activate virtual environment
venv\Scripts\activate

# Run server
python manage.py runserver
```

---

## 🧪 **Step 7: Test Transcription**

### **Option A: Using Swagger UI**

1. Go to http://localhost:8000/swagger/
2. Authenticate (get JWT token)
3. Find `POST /api/v1/lectures/{id}/generate_transcript/`
4. Try it out!

### **Option B: Using cURL**

```bash
# 1. Login to get token
curl -X POST http://localhost:8000/api/v1/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"password"}'

# Save the access token

# 2. Create a lecture
curl -X POST http://localhost:8000/api/v1/lectures/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Lecture",
    "classroom": "classroom_id",
    "recording_type": "audio"
  }'

# Save the lecture ID

# 3. Upload audio file
curl -X POST http://localhost:8000/api/v1/lectures/LECTURE_ID/upload/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio_file=@path/to/audio.mp3"

# 4. Generate transcript
curl -X POST http://localhost:8000/api/v1/lectures/LECTURE_ID/generate_transcript/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# 5. Check status
curl http://localhost:8000/api/v1/lectures/LECTURE_ID/transcript_status/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Option C: Using Python Requests**

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# 1. Login
response = requests.post(f"{BASE_URL}/accounts/login/", json={
    "email": "teacher@example.com",
    "password": "password"
})
token = response.json()['access']

headers = {"Authorization": f"Bearer {token}"}

# 2. Create lecture
response = requests.post(f"{BASE_URL}/lectures/", headers=headers, json={
    "title": "Test Lecture",
    "classroom": "classroom_id",
    "recording_type": "audio"
})
lecture_id = response.json()['id']

# 3. Upload audio
with open('audio.mp3', 'rb') as f:
    files = {'audio_file': f}
    response = requests.post(
        f"{BASE_URL}/lectures/{lecture_id}/upload/",
        headers=headers,
        files=files
    )

# 4. Generate transcript
response = requests.post(
    f"{BASE_URL}/lectures/{lecture_id}/generate_transcript/",
    headers=headers,
    json={}
)
print(response.json())

# 5. Check status
response = requests.get(
    f"{BASE_URL}/lectures/{lecture_id}/transcript_status/",
    headers=headers
)
print(response.json())
```

---

## 📊 **Expected Results**

### **Small File (<25MB) - Sync Processing:**
```json
{
  "status": "success",
  "message": "Transcript generated successfully",
  "data": {
    "transcript": "Today we will learn about...",
    "word_count": 1234,
    "language": "en",
    "processing_time": 15.5
  }
}
```

### **Large File (>=25MB) - Async Processing:**
```json
{
  "status": "processing",
  "message": "Transcription started. This may take several minutes for large files.",
  "task_id": "abc123...",
  "check_status_url": "/api/v1/lectures/{id}/transcript_status/"
}
```

**Then check status:**
```json
{
  "status": "completed",
  "has_transcript": true,
  "word_count": 3500,
  "generated_at": "2024-01-15T10:30:00Z",
  "error": null,
  "transcript_preview": "Welcome to today's lecture..."
}
```

---

## 🐛 **Troubleshooting**

### **Error: "Invalid OpenAI API key"**
- Check your API key in `.env`
- Verify it starts with `sk-`
- Check OpenAI dashboard for key status

### **Error: "FFmpeg not found"**
- Install FFmpeg (see Step 3)
- Add to PATH
- Restart terminal
- Verify: `ffmpeg -version`

### **Error: "Redis connection failed"**
- Start Redis server
- Check `REDIS_URL` in `.env`
- Verify: `redis-cli ping`

### **Error: "Celery worker not running"**
- Start Celery worker (see Step 5)
- Check for errors in Celery terminal
- Use `--pool=solo` on Windows

### **Transcription stuck in "processing"**
- Check Celery worker terminal for errors
- Check Redis is running
- Check OpenAI API quota/billing
- View logs: `tail -f logs/django.log`

---

## 📝 **Test Audio Files**

### **Option 1: Record Your Own**
Use your phone or computer to record a short audio clip (30 seconds).

### **Option 2: Use Text-to-Speech**
```python
# Generate test audio with gTTS
from gtts import gTTS

text = "Today we will learn about algebra. Algebra is a branch of mathematics."
tts = gTTS(text=text, lang='en')
tts.save("test_lecture.mp3")
```

### **Option 3: Download Sample**
- https://www.voiptroubleshooter.com/open_speech/american.html
- https://freesound.org/ (search for "speech")

---

## ✅ **Verification Checklist**

- [ ] Python dependencies installed
- [ ] `.env` configured with OpenAI API key
- [ ] FFmpeg installed and in PATH
- [ ] Redis running
- [ ] Celery worker running
- [ ] Django server running
- [ ] Test lecture created
- [ ] Audio file uploaded
- [ ] Transcript generated successfully
- [ ] Transcript visible in lecture detail

---

## 💡 **Tips**

1. **Start Small:** Test with a 30-second audio file first
2. **Monitor Costs:** Check OpenAI usage dashboard regularly
3. **Set Limits:** Configure billing limits in OpenAI dashboard
4. **Check Logs:** View Celery worker output for debugging
5. **Test Async:** Try a file >25MB to test async processing

---

## 📚 **Next Steps**

Once transcription is working:

1. **Test with different file formats** (mp3, wav, mp4)
2. **Test with different file sizes** (small vs large)
3. **Test force regenerate** option
4. **Implement frontend** to display transcripts
5. **Build Phase 2:** Notes generation (uses transcript)

---

## 🎯 **Success!**

If you can:
- ✅ Upload a lecture with audio
- ✅ Generate transcript
- ✅ View transcript in API response

**You're ready to build the next AI features!** 🚀

---

**Need help?** Check:
- `LECTURE_TRANSCRIPTION_COMPLETE.md` - Full documentation
- Django logs: `logs/django.log`
- Celery output in terminal
- OpenAI API dashboard for usage/errors
