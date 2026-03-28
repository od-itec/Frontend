# Project Templates for ITEC Deploy

This guide explains the minimum files needed for each language so that
**Sync & Detect** recognizes your project and **Build** succeeds with
the Google Cloud Buildpacks builder (`gcr.io/buildpacks/builder:google-22`).

> **Key rule**: your app **must** listen on the port provided by the `PORT`
> environment variable (defaults to `8080`).

---

## Node.js

**Marker file**: `package.json`

Minimum files:

**package.json**
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.21.0"
  }
}
```

**server.js**
```js
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("<h1>Hello from ITEC!</h1>");
});

app.listen(PORT, () => console.log("Listening on port " + PORT));
```

### Notes
- `scripts.start` tells the buildpack how to launch your app.
- Do **not** include `node_modules/` — the buildpack runs `npm install`.
- You can use a `package-lock.json` for reproducible builds but it is optional.

---

## Python

**Marker file**: `requirements.txt`

Minimum files:

**requirements.txt**
```
flask==3.1.*
gunicorn==23.*
```

**main.py**
```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def index():
    return "<h1>Hello from ITEC!</h1>"

if __name__ == "__main__":
    import os
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
```

**Procfile**
```
web: gunicorn --bind :$PORT main:app
```

### Notes
- The buildpack detects Python via `requirements.txt`.
- A `Procfile` is recommended to specify the start command;
  without it the buildpack falls back to `gunicorn main:app`.
- Use `gunicorn` (or `uvicorn` for async) as the production server.

---

## Go

**Marker file**: `go.mod`

Minimum files:

**go.mod**
```
module myapp

go 1.21
```

**main.go**
```go
package main

import (
    "fmt"
    "net/http"
    "os"
)

func main() {
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "<h1>Hello from ITEC!</h1>")
    })
    http.ListenAndServe(":"+port, nil)
}
```

### Notes
- The buildpack detects Go via `go.mod`.
- No `Procfile` needed — the buildpack auto-detects and compiles `main.go`.

---

## Generic / Procfile

**Marker file**: `Procfile`

If your project doesn't match one of the above languages, you can use a
`Procfile` to tell the builder how to start your app.

**Procfile**
```
web: ./start.sh
```

---

## Project Structure Tips

| Rule | Detail |
|------|--------|
| **One project = one folder** | Put each deployable app in its own subfolder (e.g. `frontend/`, `backend/`). |
| **Max depth 3** | Detection scans up to 3 levels deep from workspace root. |
| **PORT env var** | Always read `PORT` from the environment — buildpacks set it to `8080`. |
| **No binaries** | Don't upload compiled files or `node_modules` — buildpacks handle dependencies. |
| **2 containers max** | Each user can run up to 2 containers (e.g. one frontend + one backend). |

---

## Example: Multi-Project Workspace

```
workspace/
├── frontend/
│   ├── package.json      ← detected as "node"
│   └── server.js
└── backend/
    ├── requirements.txt   ← detected as "python"
    ├── Procfile
    └── main.py
```

After **Sync & Detect**, both projects appear in the Deploy panel.
Build and run each one separately.
