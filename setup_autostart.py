"""
setup_autostart.py
Run this script once to register the app to launch at system startup
AND whenever the machine wakes from sleep (if the scheduled time was missed).

Usage:
  python setup_autostart.py              # install, default 8:00 AM
  python setup_autostart.py --time 07:30 # custom wake time
  python setup_autostart.py --remove    # unregister
"""
import os
import sys
import platform
import subprocess
import textwrap


APP_NAME   = "Typist"
PLIST_LABEL = "com.typist.morning"
DEFAULT_HOUR   = 8
DEFAULT_MINUTE = 0


def _parse_time() -> tuple[int, int]:
    for i, arg in enumerate(sys.argv):
        if arg == "--time" and i + 1 < len(sys.argv):
            try:
                h, m = sys.argv[i + 1].split(":")
                return int(h), int(m)
            except ValueError:
                print("Invalid --time format. Use HH:MM, e.g. --time 07:30")
                sys.exit(1)
    return DEFAULT_HOUR, DEFAULT_MINUTE


def _python_path() -> str:
    """Prefer the venv Python if it exists alongside this script."""
    base = os.path.dirname(os.path.abspath(__file__))
    venv_python = os.path.join(base, ".venv", "bin", "python3")
    if os.path.exists(venv_python):
        return venv_python
    return sys.executable


def _script_path() -> str:
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "main.py"))


# ──────────────────────────────────────────────────────────────────────────────
# macOS
# ──────────────────────────────────────────────────────────────────────────────

def _macos_plist_path() -> str:
    return os.path.expanduser(f"~/Library/LaunchAgents/{PLIST_LABEL}.plist")


def _install_macos() -> None:
    plist_path = _macos_plist_path()
    python = _python_path()
    script = _script_path()
    hour, minute = _parse_time()

    # StartCalendarInterval is the key trick:
    # launchd runs missed jobs the moment the machine wakes from sleep,
    # so this fires at the scheduled time OR on the first wake after it.
    plist_content = textwrap.dedent(f"""\
        <?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
          "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
        <plist version="1.0">
        <dict>
            <key>Label</key>
            <string>{PLIST_LABEL}</string>
            <key>ProgramArguments</key>
            <array>
                <string>{python}</string>
                <string>{script}</string>
            </array>
            <key>StartCalendarInterval</key>
            <dict>
                <key>Hour</key>
                <integer>{hour}</integer>
                <key>Minute</key>
                <integer>{minute}</integer>
            </dict>
            <key>StandardOutPath</key>
            <string>{os.path.expanduser("~/.typist/launch.log")}</string>
            <key>StandardErrorPath</key>
            <string>{os.path.expanduser("~/.typist/launch_error.log")}</string>
        </dict>
        </plist>
    """)

    os.makedirs(os.path.dirname(plist_path), exist_ok=True)
    with open(plist_path, "w") as f:
        f.write(plist_content)

    subprocess.run(["launchctl", "load", plist_path], check=False)
    print(f"Installed LaunchAgent: {plist_path}")
    print(f"Typist will launch at {hour:02d}:{minute:02d} daily — or on first wake after that time.")


def _remove_macos() -> None:
    plist_path = _macos_plist_path()
    if os.path.exists(plist_path):
        subprocess.run(["launchctl", "unload", plist_path], check=False)
        os.remove(plist_path)
        print(f"Removed LaunchAgent: {plist_path}")
    else:
        print("No LaunchAgent found.")


# ──────────────────────────────────────────────────────────────────────────────
# Windows
# ──────────────────────────────────────────────────────────────────────────────

def _install_windows() -> None:
    python = _python_path()
    script = _script_path()
    hour, minute = _parse_time()
    start_time = f"{hour:02d}:{minute:02d}"

    # Task Scheduler with /sc daily + /ri (run immediately if missed)
    # covers both fresh boot and wake from sleep.
    cmd = (
        f'schtasks /create /f /tn "{APP_NAME}" '
        f'/tr \\"{python}\\" \\"{script}\\" '
        f'/sc daily /st {start_time} '
        f'/ru "" '          # run as current user
    )
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"Task Scheduler entry created: {APP_NAME} at {start_time} daily.")
        print("If the computer is asleep at that time, it will run on first wake.")
    else:
        print(f"Failed to create task: {result.stderr.strip()}")


def _remove_windows() -> None:
    result = subprocess.run(
        f'schtasks /delete /f /tn "{APP_NAME}"',
        shell=True, capture_output=True, text=True,
    )
    if result.returncode == 0:
        print(f"Removed Task Scheduler entry: {APP_NAME}")
    else:
        print("No scheduled task found.")


# ──────────────────────────────────────────────────────────────────────────────
# Entry
# ──────────────────────────────────────────────────────────────────────────────

def main() -> None:
    remove = "--remove" in sys.argv
    system = platform.system()

    if system == "Darwin":
        _remove_macos() if remove else _install_macos()
    elif system == "Windows":
        _remove_windows() if remove else _install_windows()
    else:
        print(f"Auto-launch setup not supported on {system}.")
        print("You can manually add this to your startup:")
        print(f"  {_python_path()} {_script_path()}")


if __name__ == "__main__":
    main()
