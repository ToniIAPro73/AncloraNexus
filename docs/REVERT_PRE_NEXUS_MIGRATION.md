# Revertir al tag `pre-nexus-migration`

En caso de que la migración a Nexus falle, puedes volver rápidamente al estado previo usando el tag `pre-nexus-migration`.

## Pasos

1. Guarda los cambios actuales (opcional):
   ```bash
   git status
   git stash -u
   ```
2. Obtén la información más reciente del repositorio y los tags:
   ```bash
   git fetch --all --tags
   ```
3. Vuelve a la rama `main` y resetea su estado al tag:
   ```bash
   git checkout main
   git reset --hard pre-nexus-migration
   ```
4. Sube el cambio al repositorio remoto:
   ```bash
   git push origin main --force
   ```

> ⚠️ **Advertencia:** El uso de `--force` reescribe el historial de la rama `main`. Asegúrate de coordinar este paso con el equipo.

5. Recupera los cambios locales guardados (si se usó `stash`):
   ```bash
   git stash pop
   ```

Tras estos pasos, el proyecto quedará exactamente en el estado anterior a la migración.
