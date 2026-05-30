FROM python:3.11-slim AS production

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]


FROM production AS test

RUN pip install --no-cache-dir -r requirements-dev.txt

RUN python -m pytest tests/ -v --cov=. --cov-report=term-missing --cov-report=xml:coverage.xml
