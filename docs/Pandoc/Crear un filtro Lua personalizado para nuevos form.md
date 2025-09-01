<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Crear un filtro Lua personalizado para nuevos formatos en Pandoc

Para crear un filtro Lua personalizado en Pandoc y adaptar el procesamiento a nuevos formatos o necesidades, se debe crear un archivo `.lua` que manipule el árbol de sintaxis abstracta (AST) durante la conversión.[^1][^2]

## Estructura básica de un filtro Lua

- Un filtro suele ser una función asociada a un tipo de elemento (por ejemplo, `Div`, `Str`, `Para`) que recibe dicho elemento y devuelve la transformación deseada sobre él.[^1]
- El archivo Lua debe retornar una tabla con las funciones de procesamiento que se aplicarán durante el recorrido del documento.


### Ejemplo simple: convertir texto en negrita a versalitas

```lua
function Strong(elem)
  return pandoc.SmallCaps(elem.content)
end
```

- Este filtro transforma cualquier texto en negrita (`Strong`) en versalitas (`SmallCaps`).[^1]


### Ejemplo avanzado: transformar bloques con una clase personalizada a un entorno LaTeX

```lua
function Div(el)
  if el.classes:includes("miestilo") then
    return {
      pandoc.RawBlock("latex", "\\begin{miestilo}"),
      el,
      pandoc.RawBlock("latex", "\\end{miestilo}")
    }
  end
end
```

Esto inserta automáticamente los entornos LaTeX donde haya bloques con la clase `miestilo`.[^3]

## Uso del filtro con Pandoc

Guarda el filtro (por ejemplo, `mi_filtro.lua`) y al ejecutar Pandoc indica el filtro con la opción:

```
pandoc archivo.md --lua-filter=mi_filtro.lua -o archivo.tex
```

Puedes usar filtros Lua tanto para adaptar la salida a formatos existentes como para manipular datos, metadatos o insertar comportamientos específicos en el flujo de conversión.[^2][^1]

## Personalización y documentación

- Se pueden combinar múltiples filtros, usándolos en orden con varias opciones `--lua-filter`.
- Los filtros Lua acceden a todo el poder de manipulación del AST de Pandoc, son ligeros y portables, y suelen ser mucho más eficientes que los filtros externos.[^4][^1]
- Para soporte avanzado de formatos nuevos, se recomienda consultar la sección oficial de filtros Lua y custom writers/readers en la web de Pandoc.[^5][^2]

Esto convierte a los filtros Lua en la opción más **directa** y potente para personalizar y extender Pandoc, incluso sin necesidad de tocar el código fuente principal de la herramienta.[^3][^2][^1]
<span style="display:none">[^10][^6][^7][^8][^9]</span>

<div style="text-align: center">⁂</div>

[^1]: https://pandoc.org/lua-filters.html

[^2]: https://pandoc.org/custom-readers.html

[^3]: https://gnutas.juanmanuelmacias.com/pandoc-docx.html

[^4]: https://pandoc.org/filters.html

[^5]: https://pandoc.org/custom-writers.html

[^6]: https://www.reddit.com/r/lua/comments/ze0ahg/how_do_i_replace_part_of_a_string_with_a_lua/?tl=es-419

[^7]: https://stackoverflow.com/questions/73622285/use-lua-filter-to-set-pandoc-template-variable

[^8]: https://www.reddit.com/r/ObsidianMD/comments/1mzmgou/i_wrote_a_plugin_to_support_many_pandocmarkdown/?tl=es-419

[^9]: https://github.com/jgm/pandoc/discussions/10392

[^10]: https://www.youtube.com/watch?v=RHFhgYhRavc

