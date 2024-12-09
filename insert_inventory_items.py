import sqlite3

def inserir_item_inventario(item, quantidade, descricao, preco):
    # Conectar ao banco de dados
    conn = sqlite3.connect('db/new_dashboard.db')
    cursor = conn.cursor()
    
    try:
        # Calcular o balance (preço total)
        balance = quantidade * preco
        
        # Inserir o item
        cursor.execute('''
            INSERT INTO inventory (item, quantity, descricao, preco, balance)
            VALUES (?, ?, ?, ?, ?)
        ''', (item, quantidade, descricao, preco, balance))
        
        # Commit das alterações
        conn.commit()
        print(f"Item '{item}' inserido com sucesso!")
        
        # Mostrar o item inserido
        cursor.execute('SELECT * FROM inventory WHERE id = last_insert_rowid()')
        row = cursor.fetchone()
        print("\nItem inserido:")
        print("ID | Item | Quantidade | Descrição | Preço | Balance")
        print("-" * 60)
        print(f"{row[0]} | {row[1]} | {row[2]} | {row[3]} | R${row[4]} | R${row[5]}")
            
    except sqlite3.Error as e:
        print(f"Erro ao inserir item: {e}")
        
    finally:
        # Fechar conexão
        conn.close()

if __name__ == "__main__":
    # Exemplo de uso
    item = input("Nome do item: ")
    quantidade = int(input("Quantidade: "))
    descricao = input("Descrição: ")
    preco = float(input("Preço unitário: "))
    
    inserir_item_inventario(item, quantidade, descricao, preco) 