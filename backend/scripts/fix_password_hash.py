import bcrypt
import os
import sys
import sqlite3

# Generar un hash vÃ¡lido para la contraseÃ±a
password = "Alcloratest123"
password_bytes = password.encode('utf-8')
salt = bcrypt.gensalt()
password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')

print(f"Hash generado para contraseÃ±a '{password}': {password_hash}")

# Conectar a la base de datos
conn = sqlite3.connect('C:\\Users\\Usuario\\Workspace\\01_Proyectos\\Anclora_Nexus\\backend\\src\\models\\database\\app.db')
cursor = conn.cursor()

# Actualizar el hash de contraseÃ±a para el usuario
cursor.execute(
    "UPDATE users SET password_hash = ? WHERE email = ?", 
    (password_hash, 'ancloratest@dominio.com')
)
conn.commit()

# Verificar que se ha actualizado correctamente
cursor.execute("SELECT id, email, password_hash FROM users WHERE email = ?", ('ancloratest@dominio.com',))
user = cursor.fetchone()

if user:
    print(f"Usuario ID: {user[0]}, Email: {user[1]}")
    print(f"Hash guardado en la base de datos: {user[2]}")
    print("La contraseÃ±a ha sido actualizada correctamente.")
else:
    print("No se encontrÃ³ el usuario.")

# Cerrar la conexiÃ³n
conn.close()

