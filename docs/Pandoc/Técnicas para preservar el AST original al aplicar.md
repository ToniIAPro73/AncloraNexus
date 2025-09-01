<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Técnicas para preservar el AST original al aplicar múltiples transformaciones Lua

Para preservar el **AST original** al aplicar múltiples transformaciones Lua en Pandoc, es fundamental que cada filtro siga ciertas técnicas clave para evitar modificaciones innecesarias y mantener intacta la estructura excepto en los elementos que realmente requieren cambios.[^1]

## Técnicas recomendadas

### 1. Devolver nil cuando no haya cambios

- Cuando un filtro Lua devuelve `nil` para un elemento que no necesita transformación, ese elemento permanece sin alterar en el AST.[^1]
- Solo se debe devolver un nuevo valor cuando realmente haya modificación.


### 2. Transformaciones específicas y no globales

- Cada función debe actuar únicamente sobre el tipo de nodo que le interesa, dejando todo lo demás intacto.
- Evitar recorrer manualmente el árbol completo y aplicar transformaciones globales, trabajando solo sobre los elementos necesarios.


### 3. Modularidad y orden controlado

- Encadenar filtros mediante la opción `--lua-filter` garantiza que cada filtro actúe secuencialmente y modularmente.[^1]
- Los cambios realizados por un filtro se pasan al siguiente, pero los elementos que ninguno modifica conservan su forma original.


### 4. Pruebas incrementales

- Es recomendable probar individualmente cada filtro antes de combinar varios, para garantizar que el comportamiento sea el esperado y que el AST solo es modificado donde corresponde.


## Ejemplo de filtro respetuoso

```lua
function CodeBlock(el)
  if el.classes:includes("python") then
    -- Solo modifica bloques de código Python
    return pandoc.CodeBlock("# Python code:\n" .. el.text)
  end
  -- Los otros bloques de código permanecen iguales
  return nil
end
```

- Así, el AST permanece igual salvo en los bloques de tipo Python.[^1]

Estas técnicas permiten una transformación **segura y controlada** del documento, asegurando la preservación del contenido y la estructura originales salvo en los puntos explícitamente modificados.[^1]

<div style="text-align: center">⁂</div>

[^1]: https://pandoc.org/lua-filters.html

