<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Indicar cómo ejecutar múltiples filtros Lua en una sola pasada con Pandoc

Para ejecutar **múltiples filtros Lua** en una sola pasada con Pandoc, solo debes añadir varias opciones `--lua-filter` (o su versión corta `-L`) en la línea de comandos, especificando cada filtro en el orden deseado.[^1][^2][^3]

## Sintaxis

```sh
pandoc archivo.md --lua-filter=filtro1.lua --lua-filter=filtro2.lua --lua-filter=filtro3.lua -o salida.ext
```

- Pandoc aplicará los filtros en el mismo orden en el que aparecen en la línea de comandos.[^3][^1]
- Cada filtro actúa sobre el resultado que devuelve el anterior, permitiendo una transformación secuencial del documento.


## Ejemplo práctico

```sh
pandoc documento.md -L primer-filtro.lua -L segundo-filtro.lua -L tercer-filtro.lua -o documento_final.pdf
```

- Aquí, `primer-filtro.lua` se ejecuta primero, seguido por `segundo-filtro.lua`, y finalmente `tercer-filtro.lua`.[^2][^3]


## Consideraciones

- El orden es importante: los efectos de un filtro pueden influir en el comportamiento de los sucesivos.[^3]
- Puedes combinar tantos filtros como necesites para obtener el flujo de procesamiento personalizado.

Esta característica hace que Pandoc sea una herramienta **modular** y extremadamente flexible para todo tipo de conversiones avanzadas.[^1][^2][^3]
<span style="display:none">[^10][^4][^5][^6][^7][^8][^9]</span>

<div style="text-align: center">⁂</div>

[^1]: https://pandoc.org/lua-filters.html

[^2]: https://akos.ma/blog/pandoc-filters-in-lua/

[^3]: https://nb.balaji.blog/posts/pandoc-lua-filters/

[^4]: https://stackoverflow.com/questions/78567123/returning-multiple-pandoc-action-in-lua-filters

[^5]: https://www.reddit.com/r/lua/comments/17f5ce6/what_do_yall_use_lua_for/?tl=es-es

[^6]: https://www.youtube.com/watch?v=OoadMUZaAWE

[^7]: https://www.reddit.com/r/rust/comments/11xpg6e/typst_a_modern_latex_alternative_written_in_rust/?tl=es-es

[^8]: https://docs.redhat.com/es/documentation/red_hat_enterprise_linux/8/html-single/considerations_in_adopting_rhel_8/index

[^9]: https://pandoc.org/filters.html

[^10]: http://www.resistancefutile.com

