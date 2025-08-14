from flask_socketio import SocketIO

# SocketIO instance to share across modules
socketio = SocketIO(cors_allowed_origins="*")


def emit_progress(conversion_id: int, progress: int) -> None:
    """Broadcast conversion progress to all connected clients."""
    try:
        socketio.emit("conversion_progress", {"conversion_id": conversion_id, "progress": progress})
    except Exception:
        # Durante las pruebas el servidor SocketIO no está inicializado
        pass
