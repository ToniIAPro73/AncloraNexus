<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Visualizar línea de tiempo con todos los estados intermedios

Para visualizar una **línea de tiempo con todos los estados intermedios** de un documento al aplicar filtros Lua en Pandoc, debes registrar cada cambio relevante en una estructura ordenada (por ejemplo, lista de atributos o un array global), y luego procesar y presentar esos estados secuencialmente.[^1]

## Estrategia para capturar y mostrar estados intermedios

### 1. Registrar estados después de cada transformación

Cada filtro puede almacenar el contenido del documento o de elementos clave justo después de modificarlo, guardándolo en una lista o exportándolo a archivos secuenciales:

```lua
-- Array global para estados intermedios
states = states or {}

function Div(el)
  -- Solo en los bloques de interés
  if el.classes:includes("track") then
    table.insert(states, pandoc.utils.stringify(el.content))
    -- Realiza transformación
    el.content = {pandoc.Str("Paso siguiente")}
    return el
  end
  return nil
end

function Pandoc(doc)
  -- Al final, vuelca los estados a un archivo externo para visualización
  local f = io.open("timeline.txt", "w")
  for idx, v in ipairs(states) do
    f:write("Estado " .. idx .. ": " .. v .. "\n")
  end
  f:close()
  return doc
end
```


### 2. Exportar versiones completas

- Puedes guardar cada versión completa del documento tras cada filtro usando la función `Pandoc`. Por ejemplo, escribe a archivos `estado_1.md`, `estado_2.md` después de cada pasada, para poder reconstruir o visualizar la evolución global.


### 3. Visualización de la línea de tiempo

- Los archivos secuenciales (`timeline.txt`, `estado_1.md`, etc.) pueden visualizarse en cualquier editor de texto, o importar esos datos en una herramienta (R, Python, etc.) para generar una línea de tiempo gráfica o un diffs interactivo entre estados.


## Buenas prácticas y recomendaciones

- Asegura que cada filtrado relevante almacene su propio estado intermedio antes de cada mutación.
- Selecciona qué partes o el documento completo guardar en función de tus necesidades de análisis.
- Utiliza nombres de archivo o marcas de tiempo claros para reconstruir el flujo de transformación.

Este enfoque permite una **auditoría completa** y visualización detallada del proceso de transformación de documentos en Pandoc, facilitando depuración, formación y demostraciones técnicas avanzadas.[^1]

<div style="text-align: center">⁂</div>

[^1]: https://pandoc.org/lua-filters.html

