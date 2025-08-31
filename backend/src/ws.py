from enum import Enum
from typing import Union

from flask_socketio import SocketIO

# SocketIO instance to share across modules
socketio = SocketIO(cors_allowed_origins="*")


class Phase(str, Enum):
    """Conversion processing phases."""

    PREPROCESS = "preprocess"
    CONVERT = "convert"
    POSTPROCESS = "postprocess"


def emit_progress(conversion_id: int, phase: Union[Phase, str], percent: int) -> None:
    """Broadcast conversion progress to all connected clients."""
    try:
        socketio.emit(
            "conversion_progress",
            {"conversion_id": conversion_id, "phase": phase, "percent": percent},
        )
    except Exception:
        # Durante las pruebas el servidor SocketIO no estÃ¡ inicializado
        pass


