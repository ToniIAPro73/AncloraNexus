<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Describir cómo aplicar filtros Lua para agregar estilos personalizados en salidas

Para aplicar filtros Lua y así agregar **estilos personalizados** al generar salidas con Pandoc, se debe crear un filtro Lua que identifique los elementos con clases o atributos específicos en el documento fuente y luego transforme dichos bloques según el formato de salida deseado. Este procedimiento se basa en manipular el árbol de sintaxis abstracta (AST) del documento antes de que se escriba la salida final.[^1][^2]

## Pasos básicos

1. **Definir la sintaxis en el documento fuente**
    - Utiliza bloques de Markdown con atributos personalizados para marcar las secciones que deseas estilizar. Por ejemplo:

```
::: {custom-style="miestilo"}
Texto que quiero con mi estilo personalizado.
:::
```

2. **Crear el filtro Lua**
    - Escribe una función para interceptar bloques (`Div`) y aplicar el estilo en función del atributo detectado. Ejemplo para convertir a un entorno LaTeX personalizado:

```lua
function Div(el)
  if el.attributes["custom-style"] == "miestilo" then
    return {
      pandoc.RawBlock("latex", "\\begin{miestilo}"),
      el,
      pandoc.RawBlock("latex", "\\end{miestilo}")
    }
  end
end
```

    - Guarda este script como, por ejemplo, `mi_filtro.lua`.[^2]
3. **Aplicar el filtro al generar la salida**
    - Lanza Pandoc con la opción:

```
pandoc documento.md --lua-filter=mi_filtro.lua -o documento.tex
```

    - Esto hará que cualquier bloque marcado en el Markdown se convierta usando tu formato o entorno personalizado en la salida.
4. **Estilos para archivos DOCX**
    - Para docx, define primero un documento de referencia con los estilos deseados y úsalo en la opción `--reference-doc=mis_estilos.docx` junto con tu filtro Lua.[^2]

## Consideraciones

- Puedes combinar varios filtros aplicando varias opciones `--lua-filter`.
- Los filtros también permiten manipular metadatos, textos en línea, encabezados, enlaces, imágenes y cualquier otro elemento del AST.[^1]
- Es posible reescribir el contenido, insertar código raw específico (LaTeX, HTML, etc.), o cambiar atributos según condiciones avanzadas.[^1][^2]

Esta técnica de filtros Lua hace que Pandoc sea extraordinariamente **flexible** para la personalización de estilos en todo tipo de flujos de trabajo y salidas.[^2][^1]
<span style="display:none">[^10][^3][^4][^5][^6][^7][^8][^9]</span>

<div style="text-align: center">⁂</div>

[^1]: https://pandoc.org/lua-filters.html

[^2]: https://gnutas.juanmanuelmacias.com/pandoc-docx.html

[^3]: https://www.reddit.com/r/lua/comments/ze0ahg/how_do_i_replace_part_of_a_string_with_a_lua/?tl=es-419

[^4]: https://www.reddit.com/r/ObsidianMD/comments/1mzmgou/i_wrote_a_plugin_to_support_many_pandocmarkdown/?tl=es-419

[^5]: https://akos.ma/blog/pandoc-filters-in-lua/

[^6]: https://github.com/pandocker/pandocker-lua-filters

[^7]: https://emanote.srid.ca/lua-filters

[^8]: https://www.youtube.com/watch?v=OoadMUZaAWE

[^9]: https://pandoc.org/custom-writers.html

[^10]: https://gnutas.juanmanuelmacias.com/orglatex.html

