<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Mostrar ejemplos de filtros Lua para transformar bloques específicos en Markdown

A continuación se muestran varios **ejemplos de filtros Lua** para Pandoc que transforman bloques específicos en archivos Markdown, permitiendo personalizar la conversión según distintas necesidades.[^1][^2]

## Ejemplo 1: Convertir bloques con clase personalizada en entornos LaTeX

Este filtro busca bloques `Div` con la clase `alerta` y los convierte en un entorno LaTeX especial:

```lua
function Div(el)
  if el.classes:includes("alerta") then
    return {
      pandoc.RawBlock("latex", "\\begin{alerta}"),
      el,
      pandoc.RawBlock("latex", "\\end{alerta}")
    }
  end
end
```

- Útil para insertar avisos o mensajes destacados en salidas LaTeX.[^2]


## Ejemplo 2: Resaltar texto en línea con transformaciones

Este filtro transforma palabras dentro de spans con la clase `rojo` en texto rojo HTML o LaTeX según el formato de salida:

```lua
function Span(el)
  if el.classes:includes("rojo") then
    if FORMAT:match("html") then
      return pandoc.RawInline("html", '<span style="color: red;">' .. pandoc.utils.stringify(el.content) .. "</span>")
    elseif FORMAT:match("latex") then
      return pandoc.RawInline("latex", '\\textcolor{red}{' .. pandoc.utils.stringify(el.content) .. '}')
    end
  end
end
```

- Permite adaptar estilos en línea según el destino final.[^1]


## Ejemplo 3: Insertar bloques de código con sintaxis personalizada

Transforma bloques de código con la clase `shell` para que tengan una sintaxis especial en LaTeX:

```lua
function CodeBlock(el)
  if el.classes:includes("shell") then
    return pandoc.RawBlock("latex", "\\begin{shell}\n" .. el.text .. "\n\\end{shell}")
  end
end
```

- Útil para destacar comandos de terminal en documentos técnicos.[^1]

***

Estos ejemplos muestran cómo los filtros Lua permiten modificar la estructura y el formato de bloques específicos de Markdown de manera **eficiente** y adaptable a distintos formatos de salida.[^2][^1]

<div style="text-align: center">⁂</div>

[^1]: https://pandoc.org/lua-filters.html

[^2]: https://gnutas.juanmanuelmacias.com/pandoc-docx.html

