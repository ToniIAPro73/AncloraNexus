<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Integrar la línea de tiempo con el sistema de deshacer y rehacer

Para **integrar la línea de tiempo con un sistema de deshacer y rehacer** en filtros Lua para Pandoc, combina el registro secuencial de estados intermedios con lógica de navegación sobre ese historial, permitiendo así aplicar "undo" (volver a un estado anterior) o "redo" (avanzar a un estado posterior) de manera eficiente.

## Estrategia recomendada

### 1. Registrar la línea de tiempo de los estados

- Cada filtro que modifica el documento guarda el nuevo estado (o solamente el fragmento modificado) y lo añade a una lista estructurada, que puede almacenarse como un atributo especial o lista global.
- Ejemplo de registro:

```lua
states = states or {}
function Div(el)
  if el.classes:includes("timeline") then
    table.insert(states, pandoc.utils.stringify(el.content))
    -- aplicar transformación...
    return el
  end
  return nil
end
```


### 2. Implementar deshacer (undo) y rehacer (redo) sobre la línea de tiempo

- Añade índices de navegación sobre el `states` para desplazarte en la línea de tiempo:

```lua
current_state = current_state or 1
function undo()
  if current_state > 1 then current_state = current_state - 1 end
  -- restaurar el contenido desde states[current_state]
end

function redo()
  if current_state < #states then current_state = current_state + 1 end
  -- restaurar el contenido desde states[current_state]
end
```

- En los filtros, utiliza el valor del estado según el índice activo para reconstruir el documento o el fragmento.


### 3. Exportar la línea de tiempo para inspección externa

- Al final del procesamiento, puedes exportar la lista completa de estados a un archivo o visualizador específico para historia/diff.


### 4. Integración con filtros

- Los filtros pueden acceder a la línea de tiempo para retroceder, avanzar o reconstruir el estado del documento o fragmento que gestionan.
- Este sistema puede aplicarse a nodos individuales (Div, Span, etc.) o al documento completo, según el nivel de granularidad deseado.


## Ventajas de la integración

- Proporciona un historial navegable (no solo un registro pasivo), facilitando auditoría y depuración.
- Permite a usuarios y scripts moverse hacia adelante y atrás en la secuencia de transformaciones sin perder información.
- Se adapta a flujos de trabajo complejos, multiusuario o de experimentación en conversión documental.

Este enfoque ofrece una herramienta **potente y flexible** de versionado interno y control de cambios para pipelines avanzados de Pandoc+Lua.[^1]
<span style="display:none">[^2]</span>

<div style="text-align: center">⁂</div>

[^1]: https://pandoc.org/lua-filters.html

[^2]: http://ftp.lyx.de/Documentation/es/UserGuide.lyx

