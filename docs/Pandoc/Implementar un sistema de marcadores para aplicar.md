<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Implementar un sistema de marcadores para aplicar múltiples filtros secuencialmente

Para implementar un sistema de **marcadores** en el que se apliquen múltiples filtros Lua secuencialmente con Pandoc, puedes usar marcas o etiquetas en tu documento fuente (por ejemplo, clases o atributos personalizados en bloques Markdown) que cada filtro reconozca y procese por separado. Así, cada transformación se activa según su marcador, y los filtros se pueden encadenar en el orden deseado, manteniendo el AST claro y permitiendo transformaciones específicas y modulables.[^1]

## Pasos recomendados

### 1. Añadir marcadores en el documento Markdown

Marca los bloques o elementos que desees transformar con clases o atributos:

```markdown
::: {stage="uno"}
Contenido para primer filtro.
:::

::: {stage="dos"}
Contenido para segundo filtro.
:::
```


### 2. Escribir un filtro Lua para cada marcador

Cada filtro Lua se encarga de un marcador específico:

```lua
-- primer-filtro.lua
function Div(el)
  if el.attributes["stage"] == "uno" then
    -- transformación específica para 'uno'
    return pandoc.RawBlock("latex", "\\alert{" .. pandoc.utils.stringify(el.content) .. "}")
  end
end
```

```lua
-- segundo-filtro.lua
function Div(el)
  if el.attributes["stage"] == "dos" then
    -- transformación específica para 'dos'
    return pandoc.RawBlock("latex", "\\importantnote{" .. pandoc.utils.stringify(el.content) .. "}")
  end
end
```

Cada filtro solo modifica los bloques con su marcador.

### 3. Ejecutar los filtros en cadena con Pandoc

Llama a todos los filtros por orden:

```sh
pandoc archivo.md --lua-filter=primer-filtro.lua --lua-filter=segundo-filtro.lua -o salida.tex
```

La secuencia permite procesar cada marcador en la etapa deseada, incluso modificando o eliminando los marcadores a medida que avanzan las transformaciones.[^1]

## Ventajas

- Modularidad: cada filtro se mantiene pequeño, claro y específico.
- Control secuencial: puedes decidir el orden en el que se aplican y así encadenar lógicas de transformación complejas.
- Facilidad de mantenimiento y extensión: agregar nuevas etapas solo requiere un nuevo marcador y filtro.

Este enfoque con marcadores y múltiples filtros secuenciales es una estrategia **sólida y flexible** para procesar documentos complejos con distintos pasos y estilos en Pandoc.[^1]
<span style="display:none">[^2][^3][^4][^5]</span>

<div style="text-align: center">⁂</div>

[^1]: https://pandoc.org/lua-filters.html

[^2]: https://docs.redhat.com/es/documentation/red_hat_enterprise_linux/8/html-single/considerations_in_adopting_rhel_8/index

[^3]: https://mutabit.com/repos.fossil/indieweb/file?name=docs%2Fes%2Fminiwiki%2Ftiddlers.ston\&ci=trunk

[^4]: http://ftp.lyx.de/Documentation/es/UserGuide.lyx

[^5]: https://www.onworks.net/es/programs/pandoc-online

