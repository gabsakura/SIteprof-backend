import sqlite3


def deletar_coluna_balance():
    # Conectar ao banco de dados
    conn = sqlite3.connect('db/new_dashboard.db')
    cursor = conn.cursor()
    
    try:
        # SQLite não suporta DROP COLUMN diretamente, então precisamos:
        # 1. Criar uma tabela temporária sem a coluna balance
        # 2. Copiar os dados
        # 3. Dropar a tabela original
        # 4. Renomear a tabela temporária
        
        # 1. Criar tabela temporária
        cursor.execute('''
            CREATE TABLE inventory_temp (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item TEXT,
                quantity INTEGER,
                descricao TEXT,
                preco DECIMAL(10,2)
            )
        ''')
        
        # 2. Copiar dados
        cursor.execute('''
            INSERT INTO inventory_temp (id, item, quantity, descricao, preco)
            SELECT id, item, quantity, descricao, preco FROM inventory
        ''')
        
        # 3. Dropar tabela original
        cursor.execute('DROP TABLE inventory')
        
        # 4. Renomear tabela temporária
        cursor.execute('ALTER TABLE inventory_temp RENAME TO inventory')
        
        # Commit das alterações
        conn.commit()
        print("Coluna 'balance' removida com sucesso da tabela 'inventory'!")
        
    except sqlite3.OperationalError as e:
        print(f"Erro ao remover coluna: {e}")
        conn.rollback()
        
    finally:
        # Fechar conexão
        conn.close()

if __name__ == "__main__":
    deletar_coluna_balance()