<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Guardar automáticamente estados al modificar filtros

Para guardar automáticamente los **estados** de los elementos al aplicar filtros Lua en Pandoc, implementa en cada función de filtro el almacenamiento previo del contenido original (o estado relevante) en un atributo personalizado dentro del propio nodo del AST antes de hacer cualquier cambio. Esto permite recuperar dichos estados para deshacer, rehacer o auditar transformaciones posteriores.[^1]

## Ejemplo de implementación para guardado automático

```lua
function Div(el)
  if el.classes:includes("importante") then
    -- Guardar el contenido original como atributo antes de transformarlo
    el.attributes["original-content"] = pandoc.utils.stringify(el.content)
    -- Aplicar transformación (por ejemplo, envolver en un entorno LaTeX)
    return pandoc.RawBlock("latex", "\\alert{" .. pandoc.utils.stringify(el.content) .. "}")
  end
  return nil
end
```

- Aquí, el atributo `original-content` almacena el texto original del bloque antes de sustituirlo.[^1]


## Ventajas del guardado automático de estados

- Permite implementar fácilmente mecanismos de deshacer/rehacer (undo/redo).
- Facilita la trazabilidad y auditoría de cambios durante todo el procesamiento.
- Se adapta a cualquier estructura (Div, Span, CodeBlock, etc.) sin alterar la lógica del filtro principal.
- El estado guardado está disponible para filtros posteriores o para restauraciones, simplemente consultando el atributo personalizado.

Este patrón es fundamental para lograr filtros **seguros, reversibles y auditables** en flujos de transformación avanzados usando Pandoc y Lua.[^1]

<div style="text-align: center">⁂</div>

[^1]: https://pandoc.org/lua-filters.html

