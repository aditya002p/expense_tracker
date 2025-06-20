$env:PYTHONPATH = ".\backend"
uvicorn app.main:app --reload