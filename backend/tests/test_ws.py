import importlib.util
from pathlib import Path


spec = importlib.util.spec_from_file_location(
    "ws", Path(__file__).resolve().parent / "../src/ws.py"
)
ws = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ws)


def test_emit_progress_emits_correct_event(monkeypatch):
    emitted = {}

    def fake_emit(event, data):
        emitted['event'] = event
        emitted['data'] = data

    monkeypatch.setattr(ws.socketio, 'emit', fake_emit)

    ws.emit_progress(1, 'convert', 50)

    assert emitted['event'] == 'conversion_progress'
    assert emitted['data'] == {'conversion_id': 1, 'phase': 'convert', 'percent': 50}

