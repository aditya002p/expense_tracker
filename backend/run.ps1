$env:PYTHONPATH = ".\app"
uvicorn app.main:app --reload