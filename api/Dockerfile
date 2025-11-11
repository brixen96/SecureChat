FROM tiangolo/uvicorn-gunicorn-fastapi:python3.11

# Install Python requirements
COPY requirements.txt /app/
WORKDIR /app/
RUN python -m pip install -r requirements.txt

# Install Python app
COPY . /app/

ENV APP_MODULE=main:app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]