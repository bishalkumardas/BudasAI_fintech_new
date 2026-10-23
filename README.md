# BUDASAI — Investment Research, Education & Wealth

A modern, static website for investment research, financial education, and wealth management built with pure HTML, CSS, and JavaScript.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Server
```bash
python main.py
```

The site will be available at: **http://localhost:8000**

### 3. Project Structure

```
.
├── main.py                      # FastAPI server (serves static files)
├── requirements.txt             # Python dependencies
├── public/
│   └── budasai/
│       ├── index.html          # Home page
│       ├── components/         # Reusable HTML components
│       │   ├── header.html
│       │   └── footer.html
│       ├── assets/
│       │   ├── css/
│       │   │   └── styles.css   # All styles
│       │   └── js/
│       │       ├── main.js      # Core site logic
│       │       ├── api.js       # API client (FastAPI ready)
│       │       ├── calculators.js
│       │       └── dummy-data.js
│       ├── research/            # Research pages
│       ├── blog/                # Blog pages
│       ├── calculators/         # Tools & calculators
│       ├── company/             # Company research pages
│       └── admin/               # Admin panel
└── README.md
```

## ✨ Features

- **Pure Static HTML/CSS/JS** — No build tools needed
- **Component System** — Reusable header/footer components loaded dynamically
- **Dark/Light Theme** — Theme toggle with localStorage persistence
- **API-Ready** — Built-in API client for FastAPI backend integration
- **Responsive Design** — Mobile-first, works on all devices
- **Smooth Animations** — Scroll reveals, counters, sparklines
- **Newsletter Form** — Newsletter subscription ready
- **Dummy Data Fallback** — Works offline with bundled demo data

## 🔌 API Integration

The site includes `window.BUDASAI_API` for connecting to a FastAPI backend:

```javascript
// Configure API in admin panel or localStorage
const config = {
  base: "http://localhost:8000/api",
  endpoints: {
    research: { path: "/research", method: "GET" },
    tickers: { path: "/tickers", method: "GET" }
  }
};

// Fetch data with automatic fallback to dummy data
const data = await window.BUDASAI_API.fetchData('research');
```

## 🎨 Customization

### Add New Pages
1. Create HTML file in `public/budasai/`
2. Reference `assets/css/styles.css` and `assets/js/main.js`
3. Use component loader: `<div data-component="header"></div>`

### Update Styles
- Edit `public/budasai/assets/css/styles.css`
- CSS variables available: `--primary`, `--background`, etc.

### Add Components
- Create HTML in `public/budasai/components/`
- Load with: `<div data-component="name"></div>`

## 📊 Environment

**Development:**
```bash
python main.py
# Visit http://localhost:8000
```

**Production:**
```bash
gunicorn main:app --workers 4
```

## 🛠 Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend:** FastAPI + Uvicorn
- **Styling:** CSS Grid, Flexbox, CSS Variables
- **Icons:** Inline SVG
- **Fonts:** Google Fonts (Inter, Space Grotesk, JetBrains Mono)

## 📝 License

MIT
