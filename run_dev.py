#!/usr/bin/env python3
"""
COC Clan App — Development Runner
Starts Backend (Django/Daphne on :8000) and Frontend (Next.js on :3000) concurrently.

Usage:  python run_dev.py
"""

import os
import sys
import signal
import subprocess
import threading
import time
import platform
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "Backend"
FRONTEND = ROOT / "Frontend"
IS_WIN = platform.system() == "Windows"


# ── colours ──────────────────────────────────────────────────────────
class C:
    BD = "\033[1m"
    B = "\033[94m"
    CY = "\033[96m"
    G = "\033[92m"
    Y = "\033[93m"
    R = "\033[91m"
    E = "\033[0m"


def banner():
    print(f"""{C.BD}{C.CY}
╔══════════════════════════════════════════════════╗
║         ⚔️  COC Clan App — Dev Runner  ⚔️        ║
╚══════════════════════════════════════════════════╝{C.E}
""")


def urls():
    print(f"""
{C.G}{C.BD}🚀  Services ready!{C.E}

  {C.CY}Frontend:{C.E}   http://localhost:3000
  {C.CY}Backend:{C.E}    http://localhost:8000
  {C.CY}Health:{C.E}     http://localhost:8000/api/health/
  {C.CY}WebSocket:{C.E}  ws://localhost:8000/ws/chat/<channelId>/?token=<jwt>
  {C.CY}Admin:{C.E}      http://localhost:8000/admin/

  Press {C.Y}Ctrl+C{C.E} to stop all services.
""")


# ── dependency checks ────────────────────────────────────────────────
def check_deps():
    errors = []

    # Backend
    if not (BACKEND / "requirements.txt").exists():
        errors.append(f"{C.R}✗ Backend/requirements.txt missing.{C.E}")

    try:
        __import__("django")
    except ImportError:
        act = "venv\\Scripts\\activate" if IS_WIN else "source venv/bin/activate"
        errors.append(
            f"""{C.R}✗ Django not found in this Python environment.{C.E}
    cd {BACKEND}
    python -m venv venv
    {act}
    pip install -r requirements.txt
    python manage.py migrate"""
        )

    # Frontend
    if not (FRONTEND / "package.json").exists():
        errors.append(f"{C.R}✗ Frontend/package.json missing.{C.E}")
    elif not (FRONTEND / "node_modules").exists():
        errors.append(
            f"""{C.R}✗ Frontend node_modules missing.{C.E}
    cd {FRONTEND}
    npm install"""
        )

    if errors:
        print(f"\n{C.BD}Dependency checks failed:{C.E}\n")
        for e in errors:
            print(e + "\n")
        sys.exit(1)

    print(f"  {C.G}✓{C.E} All dependencies OK")


# ── env loading ──────────────────────────────────────────────────────
def load_envs():
    for fp in [BACKEND / ".env", BACKEND / ".env.dev", FRONTEND / ".env.local"]:
        if fp.exists():
            with open(fp) as fh:
                for raw in fh:
                    line = raw.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, _, v = line.partition("=")
                        os.environ.setdefault(k.strip(), v.strip())
            print(f"  {C.G}✓{C.E} Loaded {fp.relative_to(ROOT)}")


# ── process management ───────────────────────────────────────────────
_procs: list[subprocess.Popen] = []


def _kill(p: subprocess.Popen):
    try:
        if IS_WIN:
            p.terminate()
        else:
            os.killpg(os.getpgid(p.pid), signal.SIGTERM)
    except (ProcessLookupError, OSError):
        pass


def cleanup(*_):
    print(f"\n{C.Y}Shutting down…{C.E}")
    for p in _procs:
        _kill(p)
    for p in _procs:
        try:
            p.wait(timeout=5)
        except subprocess.TimeoutExpired:
            try:
                if IS_WIN:
                    p.kill()
                else:
                    os.killpg(os.getpgid(p.pid), signal.SIGKILL)
            except (ProcessLookupError, OSError):
                pass
    print(f"{C.G}All services stopped.{C.E}")
    sys.exit(0)


def stream(proc: subprocess.Popen, prefix: str, colour: str):
    try:
        assert proc.stdout is not None
        for line in iter(proc.stdout.readline, ""):
            if line:
                sys.stdout.write(f"{colour}[{prefix}]{C.E} {line}")
                sys.stdout.flush()
    except (ValueError, OSError):
        pass


def spawn(cmd: list[str], cwd: Path, label: str) -> subprocess.Popen:
    kw: dict = dict(
        cwd=str(cwd),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        env=os.environ.copy(),
    )
    if IS_WIN:
        kw["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        kw["preexec_fn"] = os.setsid

    try:
        p = subprocess.Popen(cmd, **kw)
        _procs.append(p)
        print(f"  {C.G}✓{C.E} {label} (pid {p.pid})")
        return p
    except FileNotFoundError as exc:
        print(f"  {C.R}✗ Failed to start {label}: {exc}{C.E}")
        cleanup()
        sys.exit(1)


# ── main ─────────────────────────────────────────────────────────────
def main():
    banner()

    print(f"{C.BD}1/3  Checking dependencies…{C.E}")
    check_deps()

    print(f"\n{C.BD}2/3  Loading environment…{C.E}")
    load_envs()

    # Auto-migrate
    print(f"\n{C.BD}      Running migrations…{C.E}")
    env = os.environ.copy()
    env["DJANGO_SETTINGS_MODULE"] = "config.settings.dev"
    result = subprocess.run(
        [sys.executable, "manage.py", "migrate", "--no-input"],
        cwd=str(BACKEND),
        env=env,
        capture_output=True,
        text=True,
    )
    if result.returncode == 0:
        print(f"  {C.G}✓{C.E} Migrations applied")
    else:
        print(f"  {C.Y}⚠ Migration output:{C.E}\n{result.stderr or result.stdout}")

    print(f"\n{C.BD}3/3  Starting services…{C.E}")
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    npm = "npm.cmd" if IS_WIN else "npm"

    be = spawn(
        [sys.executable, "-m", "daphne", "-b", "0.0.0.0", "-p", "8000",
         "config.asgi:application"],
        BACKEND,
        "Backend  → http://localhost:8000",
    )
    fe = spawn(
        [npm, "run", "dev"],
        FRONTEND,
        "Frontend → http://localhost:3000",
    )

    urls()

    threading.Thread(target=stream, args=(
        be, "backend", C.B), daemon=True).start()
    threading.Thread(target=stream, args=(
        fe, "frontend", C.CY), daemon=True).start()

    while True:
        for proc, name in [(be, "Backend"), (fe, "Frontend")]:
            if proc.poll() is not None:
                print(f"\n{C.R}{name} exited (code {proc.returncode}).{C.E}")
                cleanup()
        time.sleep(0.5)


if __name__ == "__main__":
    main()
