import sqlite3

def deletar_tabela_users():
    # Conectar ao banco de dados
    conn = sqlite3.connect('db/new_dashboard.db')
    cursor = conn.cursor()
    
    try:
        # Deletar a tabela users
        cursor.execute('DROP TABLE IF EXISTS users')
        
        # Commit das alterações
        conn.commit()
        print("Tabela 'users' deletada com sucesso!")
        
    except sqlite3.OperationalError as e:
        print(f"Erro ao deletar tabela: {e}")
        
    finally:
        # Fechar conexão
        conn.close()

def adicionar_coluna_balance():
    # Conectar ao banco de dados
    conn = sqlite3.connect('db/new_dashboard.db')
    cursor = conn.cursor()
    
    try:
        # Adicionar coluna de dinheiro
        cursor.execute('''
            ALTER TABLE inventory 
            ADD COLUMN balance DECIMAL(10,3);
        ''')
        
        # Commit das alterações
        conn.commit()
        print("Coluna de dinheiro adicionada com sucesso!")
        
    except sqlite3.OperationalError as e:
        print(f"Erro ao adicionar coluna: {e}")
        
    finally:
        # Fechar conexão
        conn.close()

if __name__ == "__main__":
    deletar_tabela_users()
    adicionar_coluna_balance()
