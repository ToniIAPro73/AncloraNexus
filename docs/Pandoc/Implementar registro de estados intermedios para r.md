<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Implementar registro de estados intermedios para revertir filtros fácilmente

Para implementar un **registro de estados intermedios** que permita revertir fácilmente filtros en Pandoc con Lua, puedes almacenar el estado original de los elementos antes de aplicar cada transformación, usando atributos personalizados en el propio AST. Esto facilita que un filtro posterior (o el mismo filtro en modo reversión) pueda restaurar el contenido previo si es necesario.

## Estrategia de implementación

### 1. Guardar el estado original en atributos antes de modificar

```lua
function Span(el)
  if some_condition and not el.attributes["original-content"] then
    el.attributes["original-content"] = pandoc.utils.stringify(el.content)
    -- Aplica transformación al contenido
    el.content = {pandoc.Str("Transformado")}
    return el
  end
  return nil
end
```

- Almacena el contenido original como atributo `original-content` antes de cualquier cambio.


### 2. Revertir gracias al registro de estado

```lua
function Span(el)
  if el.attributes["original-content"] then
    -- Recupera el estado original y lo restaura
    el.content = {pandoc.Str(el.attributes["original-content"])}
    el.attributes["original-content"] = nil -- Limpia el registro si ya no es necesario
    return el
  end
  return nil
end
```

- Si existe el marcador, restaura el contenido previo y elimina el atributo de registro.


### 3. Aplicar filtros en secuencia

- Al encadenar filtros (`--lua-filter=filtro1.lua --lua-filter=reversor.lua`), puedes revertir elementos concretos basándote en los estados guardados en los atributos.


### 4. Ventajas del registro de estados

- Permite implementar un historial simple y controlado de los cambios realizados por los filtros.
- Facilita la depuración, el deshacer selectivo o flujos avanzados de transformación y previsualización.
- Se adapta a cualquier tipo de nodo del AST de Pandoc.

Este enfoque ofrece un mecanismo **robusto y flexible** para manejar transformaciones reversibles y mantener el control sobre el historial de ediciones en documentos procesados por Pandoc con Lua.[^1]
<span style="display:none">[^2][^3]</span>

<div style="text-align: center">⁂</div>

[^1]: https://pandoc.org/lua-filters.html

[^2]: https://mutabit.com/repos.fossil/documentaton/uv/es/documentaton.pdf

[^3]: http://ftp.lyx.de/Documentation/es/UserGuide.lyx

