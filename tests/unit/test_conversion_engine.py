import os

from src.models.conversion import ConversionEngine


class TestConversionEngine:
    """Pruebas unitarias para ConversionEngine"""

    def test_get_supported_formats(self):
        engine = ConversionEngine()
        formats = engine.get_supported_formats('txt')
        assert 'html' in formats
        assert 'pdf' in formats

    def test_get_conversion_cost(self):
        engine = ConversionEngine()
        assert engine.get_conversion_cost('txt', 'html') == 1
        assert engine.get_conversion_cost('jpg', 'gif') == 2

    def test_validate_file(self, tmp_path):
        engine = ConversionEngine()
        missing = tmp_path / 'missing.txt'
        assert engine.validate_file(str(missing))[0] is False
        valid = tmp_path / 'valid.txt'
        valid.write_text('hello')
        assert engine.validate_file(str(valid))[0] is True

    def test_convert_txt_to_html(self, tmp_path):
        engine = ConversionEngine()
        input_file = tmp_path / 'input.txt'
        input_file.write_text('hola mundo')
        output_file = tmp_path / 'output.html'
        success, message = engine.convert_file(
            str(input_file), str(output_file), 'txt', 'html'
        )
        assert success is True
        assert os.path.exists(output_file)
        content = output_file.read_text()
        assert '<html' in content.lower()
