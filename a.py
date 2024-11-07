import sqlite3

# Conectar ao banco de dados
db_path = './db/new_dashboard.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Dados dos itens do inventário
inventory_items = [
    ("Smartphone", 100),
    ("Teclado Mecânico", 50),
    ("Micro-ondas", 30),
    ("Camiseta Unissex", 200),
    ("Creme Hidratante", 150),
    ("Café em Pó", 500),
    ("Caderno Universitário", 120),
    ("Furadeira Elétrica", 20),
    ("Quebra-Cabeça", 80),
    ("Desinfetante", 300)
]

# Função para inserir os itens no banco de dados
def populate_inventory_data():
    for item, quantity in inventory_items:
        cursor.execute('''
            INSERT INTO inventory (item, quantity)
            VALUES (?, ?)
        ''', (item, quantity))
    
    # Salvar as alterações
    conn.commit()
    print("Inventário populado com sucesso!")

# Popula a tabela de inventário
populate_inventory_data()
conn.close()
