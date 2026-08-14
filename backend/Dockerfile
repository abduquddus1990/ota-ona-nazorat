# Hardened Minimal Python Image
FROM python:3.11-slim

# Root bo'lmagan xavfsiz foydalanuvchi yaratish (Security Principle of Least Privilege)
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Ruxsatlarni o'rnatish
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
