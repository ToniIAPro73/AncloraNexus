import sqlite3

# Conectar a la base de datos
conn = sqlite3.connect('C:\\Users\\Usuario\\Workspace\\01_Proyectos\\Anclora_Nexus\\backend\\src\\models\\database\\app.db')
cursor = conn.cursor()

# Verificar si el usuario ya existe
cursor.execute("SELECT id FROM users WHERE email = ?", ('ancloratest@dominio.com',))
user = cursor.fetchone()

if user:
    print(f"El usuario de prueba ya existe con ID: {user[0]}")
    # Actualizar la contraseña (un hash simple para pruebas)
    cursor.execute(
        "UPDATE users SET password_hash = ? WHERE email = ?", 
        ('$2b$12$Q2oAHGe4.UIIifIdfsdfsdf432r3RLSI0oIHFHFlsdfwsw32SAf', 'ancloratest@dominio.com')
    )
    conn.commit()
    print("Contraseña actualizada")
else:
    # Crear el usuario
    cursor.execute(
        """
        INSERT INTO users (
            email, password_hash, full_name, plan, credits, 
            total_conversions, credits_used_today, credits_used_this_month,
            last_reset_date, created_at, updated_at, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, date('now'), datetime('now'), datetime('now'), ?)
        """,
        (
            'ancloratest@dominio.com',
            '$2b$12$Q2oAHGe4.UIIifIdfsdfsdf432r3RLSI0oIHFHFlsdfwsw32SAf',  # hash genérico
            'Usuario de Prueba',
            'PRO',
            100,  # créditos
            0,    # conversiones totales
            0,    # créditos usados hoy
            0,    # créditos usados este mes
            1     # is_active
        )
    )
    conn.commit()
    print("Usuario de prueba creado correctamente")

# Cerrar la conexión
conn.close()
