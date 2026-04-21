import os
import sys
import webview

from app.api import Api

# When bundled by PyInstaller, files live under sys._MEIPASS
BASE_DIR = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
UI_PATH  = os.path.join(BASE_DIR, "ui", "index.html")


def main() -> None:
    api = Api()

    window = webview.create_window(
        title="Typist",
        url=f"file://{UI_PATH}",
        js_api=api,
        width=860,
        height=600,
        resizable=True,
        min_size=(700, 480),
        background_color="#0f0f11",
        text_select=False,
        on_top=False,
        frameless=False,
        easy_drag=False,
        fullscreen=True,
    )

    webview.start(
        debug="--debug" in sys.argv,
        gui=None,
    )


if __name__ == "__main__":
    main()
