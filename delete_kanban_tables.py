import sqlite3

def deletar_tabelas_kanban():
    # Conectar ao banco de dados
    conn = sqlite3.connect('db/new_dashboard.db')
    cursor = conn.cursor()
    
    try:
        # Deletar as tabelas na ordem correta (devido às foreign keys)
        cursor.execute('DROP TABLE IF EXISTS card_labels')
        print("Tabela 'card_labels' deletada com sucesso!")
        
        cursor.execute('DROP TABLE IF EXISTS kanban_cards')
        print("Tabela 'kanban_cards' deletada com sucesso!")
        
        cursor.execute('DROP TABLE IF EXISTS kanban_columns')
        print("Tabela 'kanban_columns' deletada com sucesso!")
        
        cursor.execute('DROP TABLE IF EXISTS kanban_boards')
        print("Tabela 'kanban_boards' deletada com sucesso!")
        
        # Commit das alterações
        conn.commit()
        print("\nTodas as tabelas do Kanban foram deletadas com sucesso!")
        
    except sqlite3.OperationalError as e:
        print(f"Erro ao deletar tabelas: {e}")
        
    finally:
        # Fechar conexão
        conn.close()

if __name__ == "__main__":
    deletar_tabelas_kanban() 