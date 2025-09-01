<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Indicar cómo extender Pandoc para soportar otros formatos

Pandoc se puede **extender** para soportar nuevos formatos principalmente de dos maneras: creando filtros personalizados y desarrollando nuevos lectores o escritores en Haskell (el lenguaje en el que está escrito Pandoc).[^1][^2]

## Filtros personalizados

- Un filtro es un script o pequeño programa que procesa el documento durante la conversión, permitiendo modificar el contenido (añadir/quitar/separar elementos), o incluso generar partes del documento en un formato personalizado.
- Los filtros pueden escribirse en Python, Lua, JavaScript u otros lenguajes. El método más sencillo y soportado es mediante Lua, gracias a los filtros Lua de Pandoc.[^2]
- Se utiliza la opción `--lua-filter=archivo.lua` para aplicar el filtro durante la conversión.


## Creando nuevos lectores o escritores

- Para agregar soporte completo a un nuevo formato de entrada o salida (más allá de lo que ofrecen los filtros), es necesario extender Pandoc a nivel de código fuente.
- Esto implica implementar un nuevo “reader” (lector) o “writer” (escritor) en Haskell, siguiendo la arquitectura de Pandoc.
- Este trabajo se suele realizar colaborativamente y se recomienda consultar la documentación oficial y el repositorio de GitHub.[^1][^2]


## Resumen rápido

- Para pequeñas adaptaciones y transformaciones, lo más sencillo es usar filtros Lua para preprocesar o postprocesar el contenido.
- Para soporte pleno de un nuevo formato, hay que programar un módulo en Haskell para incluir el formato en el núcleo de Pandoc.[^2][^1]

Esto permite que Pandoc sea una herramienta muy **flexible** y adaptable a distintos flujos de trabajo y necesidades específicas.[^1][^2]
<span style="display:none">[^10][^11][^3][^4][^5][^6][^7][^8][^9]</span>

<div style="text-align: center">⁂</div>

[^1]: https://elbinario.net/2015/03/26/pandoc-el-convertidor-de-archivos-definitivo/

[^2]: https://pandoc.org

[^3]: https://www.reddit.com/r/pandoc/comments/1dvjdet/is_it_possible_for_a_file_with_multiple_formats/?tl=es-es

[^4]: https://www.youtube.com/watch?v=nUfYebx7MXI

[^5]: https://hijosdeinit.gitlab.io/howto_conversion_basica_textos_y_web_mediante_pandoc/

[^6]: https://ondahostil.wordpress.com/2017/04/27/documentacion-para-un-proyecto-con-markdown-y-pandoc/

[^7]: https://ull-esit-pl-1617.github.io/tareas-iniciales-Edu-Guille-Oscar-Sergio/Tutorial/Pandoc/pandoc.html

[^8]: https://ull-esit-dsi-1617.github.io/estudiar-cookies-y-sessions-en-expressjs-angel-alexandra-nicolangelo-p4-35l2/node/chapter4/chapter4.html

[^9]: https://bookdown.org/Rcduarte/cursor2021/pandoc.html

[^10]: https://jbravomontero.wordpress.com/2013/01/08/markdown-pandoc-y-generacion-de-libros-y-articulos-en-multiples-formatos-de-forma-sencilla/

[^11]: https://www.reddit.com/r/ObsidianMD/comments/1d1io5h/can_someone_please_eli5_me_how_to_convert_my/?tl=es-es

