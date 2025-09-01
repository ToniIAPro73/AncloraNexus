<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Integrar resultados de varios filtros Lua sin alterar el AST original

Para integrar los resultados de varios **filtros Lua** con Pandoc sin alterar el AST original fuera de las transformaciones explícitas de cada filtro, simplemente debes asegurarte de que cada filtro devuelva `nil` para los elementos que no desea modificar. Esto mantiene intacto cualquier elemento no tocado por el filtro y asegura que solo los nodos modificados sean reemplazados, dejando el resto del documento original sin cambios.[^1]

## Principios clave

- Por defecto, si un filtro Lua retorna `nil` en su función, el elemento correspondiente del AST permanece inalterado.[^1]
- Cuando se usan múltiples filtros con `--lua-filter`, cada filtro trabaja sobre el resultado modificado por el filtro anterior, y los elementos no interceptados no se ven afectados.
- Un filtro que retorna un objeto únicamente cambia el elemento recibido, y no el árbol completo, asegurando una integración limpia.[^1]


## Ejemplo sencillo de filtro "respetuoso"

```lua
function Para(para)
  if para.content[^4] and para.content[^4].text == "IMPORTANTE:" then
    -- Solo modifica párrafos que comienzan con esa palabra
    return pandoc.RawBlock("latex", "\\textbf{IMPORTANTE:} " .. pandoc.utils.stringify(para))
  end
  -- El resto de los párrafos no se modifican
  return nil
end
```

Así, los filtros convierten solo aquellos nodos elegidos, dejando el resto igual a menos que otro filtro diferente los intercepte.[^1]

## Integración secuencial sin conflicto

Utiliza varios filtros de esta forma:

```sh
pandoc archivo.md --lua-filter=primer-filtro.lua --lua-filter=segundo-filtro.lua -o salida.pdf
```

Cada filtro solo toca los elementos para los que tiene lógica, pasando los demás sin modificaciones, respetando así la estructura y contenido original del AST.[^1]

Este enfoque permite que la integración de filtros sea **modular** y no destructiva sobre el documento, garantizando un procesamiento limpio, eficiente y controlado.[^1]
<span style="display:none">[^2][^3]</span>

<div style="text-align: center">⁂</div>

[^1]: https://pandoc.org/lua-filters.html

[^2]: https://docs.redhat.com/es/documentation/red_hat_enterprise_linux/8/html-single/considerations_in_adopting_rhel_8/index

[^3]: https://mutabit.com/repos.fossil/indieweb/file?name=docs%2Fes%2Fminiwiki%2Ftiddlers.ston\&ci=trunk

[^4]: https://pandoc.org

