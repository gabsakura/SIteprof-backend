import sqlite3
import bcrypt
from datetime import datetime

def init_db():
    # Conectar ao banco de dados (cria se não existir)
    conn = sqlite3.connect('./db/new_dashboard.db')
    cursor = conn.cursor()

    try:
        # Criar tabela users com os novos campos
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            tipo TEXT DEFAULT 'user',
            verified BOOLEAN DEFAULT true,
            profile_image_path TEXT,
            description TEXT
        )
        ''')

        # Criar usuário admin padrão se não existir
        admin_password = b'admin123'  # Senha padrão
        hashed_password = bcrypt.hashpw(admin_password, bcrypt.gensalt()).decode('utf-8')

        cursor.execute('''
        INSERT OR IGNORE INTO users (nome, email, password, tipo, verified)
        VALUES (?, ?, ?, ?, ?)
        ''', ('Admin', 'admin@example.com', hashed_password, 'admin', True))

        # Commit das alterações
        conn.commit()
        print("Tabela users criada/atualizada com sucesso!")

    except sqlite3.Error as e:
        print(f"Erro ao criar/atualizar tabela: {e}")
    
    finally:
        # Fechar conexão
        conn.close()

def add_test_users():
    conn = sqlite3.connect('./db/new_dashboard.db')
    cursor = conn.cursor()

    try:
        # Lista de usuários de teste
        test_users = [
            {
                'nome': 'João Silva',
                'email': 'joao@teste.com',
                'password': 'senha123',
                'tipo': 'user',
                'description': 'Usuário de teste com uma descrição longa sobre suas atividades e interesses.'
            },
            {
                'nome': 'Maria Santos',
                'email': 'maria@teste.com',
                'password': 'senha456',
                'tipo': 'user',
                'description': 'Perfil profissional com experiência em várias áreas.'
            }
        ]

        # Inserir usuários de teste
        for user in test_users:
            hashed_password = bcrypt.hashpw(
                user['password'].encode('utf-8'), 
                bcrypt.gensalt()
            ).decode('utf-8')

            cursor.execute('''
            INSERT OR IGNORE INTO users 
            (nome, email, password, tipo, verified, description)
            VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                user['nome'],
                user['email'],
                hashed_password,
                user['tipo'],
                True,
                user['description']
            ))

        conn.commit()
        print("Usuários de teste adicionados com sucesso!")

    except sqlite3.Error as e:
        print(f"Erro ao adicionar usuários de teste: {e}")
    
    finally:
        conn.close()

def show_all_users():
    conn = sqlite3.connect('./db/new_dashboard.db')
    cursor = conn.cursor()

    try:
        # Selecionar todos os usuários (exceto a senha por segurança)
        cursor.execute('''
        SELECT id, nome, email, tipo, verified, profile_image_path, description 
        FROM users
        ''')
        
        users = cursor.fetchall()
        
        print("\nUsuários cadastrados:")
        print("-" * 50)
        for user in users:
            print(f"ID: {user[0]}")
            print(f"Nome: {user[1]}")
            print(f"Email: {user[2]}")
            print(f"Tipo: {user[3]}")
            print(f"Verificado: {user[4]}")
            print(f"Imagem: {user[5] or 'Não definida'}")
            print(f"Descrição: {user[6] or 'Não definida'}")
            print("-" * 50)

    except sqlite3.Error as e:
        print(f"Erro ao listar usuários: {e}")
    
    finally:
        conn.close()

def add_new_columns():
    # Conectar ao banco de dados existente
    conn = sqlite3.connect('./db/new_dashboard.db')
    cursor = conn.cursor()

    try:
        # Adicionar nova coluna profile_image_path
        cursor.execute('''
        ALTER TABLE users 
        ADD COLUMN profile_image_path TEXT
        ''')
        print("Coluna profile_image_path adicionada com sucesso!")

        # Adicionar nova coluna description
        cursor.execute('''
        ALTER TABLE users 
        ADD COLUMN description TEXT
        ''')
        print("Coluna description adicionada com sucesso!")

        # Commit das alterações
        conn.commit()
        print("Tabela users atualizada com sucesso!")

    except sqlite3.Error as e:
        # SQLite retorna erro se a coluna já existe
        if 'duplicate column name' in str(e):
            print("Uma ou ambas as colunas já existem na tabela.")
        else:
            print(f"Erro ao atualizar tabela: {e}")
    
    finally:
        # Fechar conexão
        conn.close()

def show_table_info():
    conn = sqlite3.connect('./db/new_dashboard.db')
    cursor = conn.cursor()

    try:
        # Mostrar informações sobre as colunas da tabela
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        
        print("\nEstrutura atual da tabela users:")
        print("-" * 50)
        for col in columns:
            print(f"Coluna: {col[1]}, Tipo: {col[2]}")
        print("-" * 50)

    except sqlite3.Error as e:
        print(f"Erro ao buscar informações da tabela: {e}")
    
    finally:
        conn.close()

if __name__ == "__main__":
    # Primeiro inicializa o banco
    init_db()
    
    # Adiciona alguns usuários de teste
    add_test_users()
    
    # Mostra todos os usuários cadastrados
    show_all_users()
    
    # Adiciona as novas colunas
    add_new_columns()
    
    # Mostra a estrutura atual da tabela
    show_table_info()
