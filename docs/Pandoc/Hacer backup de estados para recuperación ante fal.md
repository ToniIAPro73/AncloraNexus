<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Hacer backup de estados para recuperación ante fallo

Para realizar un **backup de estados** durante la aplicación de filtros Lua en Pandoc y permitir la recuperación ante fallo, lo más efectivo es almacenar los estados originales o intermedios de los elementos clave en atributos personalizados del AST antes de modificar nada, y/o exportar estos estados a un registro externo (por ejemplo, archivo JSON o tabla Lua).[^1]

## Estrategia para backup automático

### 1. Guardado en atributos dentro del AST

Cada vez que un filtro vaya a modificar un nodo, almacena el contenido previo:

```lua
function Div(el)
  if el.classes:includes("respaldo") then
    el.attributes["backup-content"] = pandoc.utils.stringify(el.content)
    -- Transformar el contenido...
    return el
  end
  return nil
end
```

- Estos atributos quedan disponibles en el documento Pandoc para recuperación posterior si ocurre un error.[^1]


### 2. Exportar estados a un backup externo (opcional)

Puedes, además, recolectar backups y escribirlos en un archivo externo:

```lua
local backups = {}

function Div(el)
  if el.classes:includes("backup") then
    table.insert(backups, pandoc.utils.stringify(el.content))
    -- Guardar también en el nodo si deseas doble seguridad
    el.attributes["backup-content"] = pandoc.utils.stringify(el.content)
    return el
  end
end

function Pandoc(doc)
  -- Aquí podrías volcar backups a un archivo usando io.open, si Pandoc lo permite
  -- Este paso se usa más fácilmente en un pre/post-proceso Lua fuera del pipeline Pandoc
  return doc
end
```

- Así, todos los estados de interés quedan disponibles tras el filtrado y pueden recuperarse en cualquier momento si hay fallo.


### 3. Ventajas

- **Recuperación inmediata**: Se puede restaurar el contenido desde el atributo `backup-content` si hay un fallo en una etapa posterior.
- **Auditoría**: Permite reconstruir el estado anterior para depuración.
- **Seguridad**: Facilita roles avanzados como undo/redo o revisión de cambios en entornos críticos.

Trabajar con backups internos y, si se desea, externos garantiza un flujo de procesamiento **seguro, reversible y robusto** durante múltiples etapas de transformación en Pandoc y Lua.[^1]

<div style="text-align: center">⁂</div>

[^1]: https://pandoc.org/lua-filters.html

