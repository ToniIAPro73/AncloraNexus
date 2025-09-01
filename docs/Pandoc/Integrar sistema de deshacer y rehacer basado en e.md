<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Integrar sistema de deshacer y rehacer basado en estados intermedios

Para integrar un sistema de **deshacer (undo) y rehacer (redo) basado en estados intermedios** al aplicar filtros Lua en Pandoc, emplea una estructura que registre el historial de transformaciones dentro de los propios atributos de los nodos del AST. Así, puedes retroceder (deshacer) y avanzar (rehacer) por los distintos estados mediante lógica Lua, sin perder ningún estado previo o intermedio.

## Estrategia de implementación

### 1. Registro acumulativo de estados previos

- Antes de modificar el contenido de un elemento, almacena el estado previo en una lista de atributos, como un historial:

```lua
function Span(el)
  -- Inicializa historial si no existe
  el.attributes["history"] = el.attributes["history"] or {}
  -- Añade estado actual al historial
  table.insert(el.attributes["history"], pandoc.utils.stringify(el.content))
  -- Realiza la transformación
  el.content = {pandoc.Str("Transformado")}
  return el
end
```


### 2. Función para deshacer (undo)

- Añade una función que recupere el estado previo del historial y lo restaure:

```lua
function Span(el)
  if el.attributes["history"] and #el.attributes["history"] > 0 then
    -- Extrae y restaura el último estado
    el.content = {pandoc.Str(table.remove(el.attributes["history"]))}
    return el
  end
  return nil
end
```


### 3. Función para rehacer (redo)

- Si también quieres implementar rehacer, guarda por separado los estados "deshechos" y reintrodúcelos al historial al rehacer la transformación.


### 4. Aplicación con varios filtros

- Encadena los filtros “undo” y “redo” con `--lua-filter=filtro-undo.lua --lua-filter=filtro-redo.lua` según el sentido deseado. El historial se conserva en los atributos y es accesible para cualquier otro filtro Lua durante el flujo.[^1]


## Ventajas y buenas prácticas

- **Robustez**: puedes deshacer y rehacer repetidamente sin perder ningún estado intermedio.
- **Modularidad**: el sistema es compatible con cualquier nodo del AST de Pandoc.
- **Transparencia**: todo el historial queda almacenado dentro del propio documento temporal, sin archivos externos.

Este patrón facilita flujos interactivos, pruebas, reversión masiva y gestión avanzada de cambios en cualquier pipeline Lua de Pandoc, soportando así un “undo/redo” estructurado y seguro.[^1]
<span style="display:none">[^2]</span>

<div style="text-align: center">⁂</div>

[^1]: https://pandoc.org/lua-filters.html

[^2]: http://ftp.lyx.de/Documentation/es/UserGuide.lyx

