
# 🧾 Expense-tracker

This is a backend project for a Splitwise-like expense-tracker to check the sharing app, built using **FastAPI**, **PostgreSQL**, and **SQLAlchemy**.

---

## 🚀 Tech Stack

- ✅ FastAPI (Python)
- ✅ PostgreSQL (Relational Database)
- ✅ SQLAlchemy (ORM)
- ✅ Uvicorn (ASGI Server)
- ✅ Pydantic (Data Validation)
- ✅ Alembic (Migrations - optional)
- ✅ Modular Project Structure

---

## 📁 Project Structure

```
splitwise-clone/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── crud/
│   │   ├── database.py
│   │   └── core/
│   │       └── config.py
```

---

## ⚙️ Environment Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/splitwise-clone.git
   cd splitwise-clone
   ```

2. **Create Virtual Environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install Requirements**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set Environment Variables** (optional)
   Create a `.env` file or modify `config.py`.

5. **Run the Server**
   ```bash
   uvicorn app.main:app --reload
   ```

---

## 📬 API Endpoints

| Method | Endpoint               | Description                   |
|--------|------------------------|-------------------------------|
| GET    | `/`                    | API root message              |
| GET    | `/health`              | Health check endpoint         |
| POST   | `/groups/`             | Create a new group            |
| GET    | `/groups/{id}`         | Get group details             |
| POST   | `/expenses/`           | Add expense to a group        |
| GET    | `/balances/{group_id}` | Get group-wise balances       |

🔗 Visit the interactive API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 📊 Example Request

### ➕ Add Expense

**POST** `/expenses/`
```json
{
  "group_id": 1,
  "payer_id": 2,
  "amount": 500,
  "description": "Dinner",
  "split_between": [2, 3]
}
```

### ✅ Response
```json
{
  "message": "Expense added successfully",
  "expense_id": 4
}
```

---

## 💡 Contribution

Want to contribute or learn backend development? Feel free to fork and submit PRs!

---

## 🧪 Testing

```bash
pytest
```

---

## 📄 License

MIT License. Use it freely. Attribution appreciated 💙
