<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Crear función para combinar resultados de filtros en un flujo secuencial

Para implementar una función que **combine resultados de varios filtros Lua** en un flujo secuencial usando Pandoc, sigue una estrategia donde cada filtro transforma el documento parcialmente y pasa el resultado al siguiente, respetando los cambios sucesivos y asegurando la integración modular de los filtros.[^1]

## Estrategia

- Cada filtro debe estar enfocado en una transformación específica y devolviendo `nil` si no realiza cambios en el elemento, manteniendo intactos los contenidos no relevantes.
- Encadena los filtros usando la opción `--lua-filter` de Pandoc, permitiendo que el documento pase secuencialmente por cada transformación.
- Si necesitas controlar el flujo de transformaciones manualmente, puedes definir una función auxiliar en uno de los filtros para distinguir elementos ya modificados (por ejemplo, usando atributos, clases o marcadores internos).


## Ejemplo práctico

### 1. Guía para usar múltiples filtros

```sh
pandoc archivo.md --lua-filter=filtro1.lua --lua-filter=filtro2.lua --lua-filter=filtro3.lua -o salida.pdf
```

- Cada filtro procesa los resultados del anterior y pasa el documento modificado al siguiente filtro.[^1]


### 2. Ejemplo de coordinación por marcador

**filtro1.lua**

```lua
function Div(el)
  if el.classes:includes("procesar1") and not el.attributes["filter1"] then
    el.attributes["filter1"] = "aplicado"
    -- transformación específica
    return el
  end
  return nil
end
```

**filtro2.lua**

```lua
function Div(el)
  if el.attributes["filter1"] == "aplicado" and not el.attributes["filter2"] then
    el.attributes["filter2"] = "aplicado"
    -- segunda transformación
    return el
  end
  return nil
end
```

- Así, cada filtro solo actúa si corresponde y va marcando los elementos ya procesados, permitiendo una combinación ordenada y acumulativa de las transformaciones.


## Ventajas

- Modularidad total: puedes reorganizar, añadir o eliminar filtros según las necesidades del flujo.
- Seguimiento de estado: al marcar los elementos procesados, evitas dobles modificaciones accidentales.
- Integración limpia: se garantiza la compatibilidad y acumulación progresiva de los resultados de cada filtro.[^1]

Este patrón es esencial para flujos de transformación **robustos y escalables** en la conversión de documentos con Pandoc.[^1]
<span style="display:none">[^10][^11][^2][^3][^4][^5][^6][^7][^8][^9]</span>

<div style="text-align: center">⁂</div>

[^1]: https://pandoc.org/lua-filters.html

[^2]: https://www.youtube.com/watch?v=tRM_gJd2CF8

[^3]: https://dat-science.com/blog/

[^4]: https://www.youtube.com/watch?v=JTCTWbh2Rro

[^5]: https://dnme-minturdep.github.io/DT6_ciencia_de_datos_turismo/manipulaci%C3%B3n-de-datos-ordenados.html

[^6]: https://www.youtube.com/watch?v=DQk3n5WXaOw

[^7]: https://estadisticaun.github.io/Softwares/2.4-flujo-de-trabajo.html

[^8]: https://www.youtube.com/watch?v=_dNbIcozZYM

[^9]: https://docs.modyo.com/es/platform/channels/liquid-markup/filters.html

[^10]: https://www.youtube.com/watch?v=UAc5IRFiwEE

[^11]: https://los-pajaros-de-hogano.blogspot.com/2015/01/

