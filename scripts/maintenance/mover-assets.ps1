# Define las rutas
$source = "frontend/assets"
$destination = "frontend/public/assets"

# Crear carpeta destino si no existe
if (!(Test-Path -Path $destination)) {
    New-Item -ItemType Directory -Force -Path $destination
}

# Copiar toda la estructura de assets conservando subcarpetas
Copy-Item -Path "$source\*" -Destination $destination -Recurse -Force

# Eliminar carpeta original
Remove-Item -Path $source -Recurse -Force

Write-Host "✅ Archivos movidos correctamente de 'assets' a 'public/assets'."
