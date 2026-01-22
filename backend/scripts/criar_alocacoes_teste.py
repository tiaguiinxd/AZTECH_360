"""
Script para criar alocacoes de teste nos projetos.

Equipes definidas:
- Comercial: Abner (8), Gil (9) - dividir entre projetos
- Engenharia Civil: Juliana (14)
- Engenharia Tubulacao/Mecanica: Victor (16)
- Pintura: Thiago Alencar (5)
- Compras: Jefferson (20), Leandro (19) - dividir entre projetos
- Assistentes: Larissa (13), Leticia (22), Vinicius (25) - dividir entre projetos
"""

import requests

API_BASE = "http://localhost:8000/api/v1"

# IDs dos colaboradores
COMERCIAL = [8, 9]  # Abner, Gil
ENGENHARIA_CIVIL = 14  # Juliana
ENGENHARIA_MECANICA = 16  # Victor (tubulacao/mecanica)
PINTURA = 5  # Thiago Alencar
COMPRAS = [20, 19]  # Jefferson, Leandro
ASSISTENTES = [13, 22, 25]  # Larissa, Leticia, Vinicius

def get_projetos():
    """Busca todos os projetos"""
    r = requests.get(f"{API_BASE}/projetos-planejamento/")
    return r.json()

def criar_alocacao(colaborador_id, projeto_id, funcao, data_inicio, data_fim=None, percentual=100):
    """Cria uma alocacao"""
    # Converter para datetime ISO format
    if data_inicio and len(data_inicio) == 10:
        data_inicio = f"{data_inicio}T00:00:00"
    if data_fim and len(data_fim) == 10:
        data_fim = f"{data_fim}T00:00:00"

    payload = {
        "colaborador_id": colaborador_id,
        "projeto_id": projeto_id,
        "funcao": funcao,
        "data_inicio": data_inicio,
        "data_fim": data_fim,
        "horas_semanais": 40,
        "percentual_dedicacao": percentual,
        "status": "ativa",
        "observacoes": None
    }
    r = requests.post(f"{API_BASE}/alocacoes/", json=payload)
    if r.status_code in [200, 201]:
        print(f"  OK: {colaborador_id} -> projeto {projeto_id} ({funcao})")
        return True
    else:
        print(f"  ERRO: {r.status_code} - {r.text}")
        return False

def main():
    projetos = get_projetos()

    # Separar projetos por categoria
    civil = [p for p in projetos if p['categoria'] == 'CIVIL']
    mecanica_tubulacao = [p for p in projetos if p['categoria'] == 'MECANICA' and p['subcategoria'] == 'TUBULACAO']
    mecanica_pintura = [p for p in projetos if p['categoria'] == 'MECANICA' and p['subcategoria'] == 'PINTURA']
    mecanica_lancas = [p for p in projetos if p['categoria'] == 'MECANICA' and p['subcategoria'] == 'LANCAS']
    mecanica_venda = [p for p in projetos if p['categoria'] == 'MECANICA' and p['subcategoria'] == 'VENDA']

    print(f"Projetos Civil: {len(civil)}")
    print(f"Projetos Tubulacao: {len(mecanica_tubulacao)}")
    print(f"Projetos Pintura: {len(mecanica_pintura)}")
    print(f"Projetos Lancas: {len(mecanica_lancas)}")
    print(f"Projetos Venda: {len(mecanica_venda)}")

    todos_projetos = projetos

    # 1. COMERCIAL - dividir entre Abner e Gil
    print("\n=== COMERCIAL ===")
    for i, p in enumerate(todos_projetos):
        comercial_id = COMERCIAL[i % 2]
        criar_alocacao(
            comercial_id,
            p['id'],
            'gerente_projeto',
            p['data_inicio_prevista'][:10] if p['data_inicio_prevista'] else '2026-01-01',
            p['data_fim_prevista'][:10] if p['data_fim_prevista'] else None,
            percentual=30  # comercial participa parcialmente
        )

    # 2. ENGENHARIA CIVIL - Juliana nos projetos civil
    print("\n=== ENGENHARIA CIVIL (Juliana) ===")
    for p in civil:
        criar_alocacao(
            ENGENHARIA_CIVIL,
            p['id'],
            'engenheiro',
            p['data_inicio_prevista'][:10] if p['data_inicio_prevista'] else '2026-01-01',
            p['data_fim_prevista'][:10] if p['data_fim_prevista'] else None,
            percentual=100
        )

    # 3. ENGENHARIA MECANICA - Victor nos projetos de tubulacao e lancas
    print("\n=== ENGENHARIA MECANICA (Victor) ===")
    mecanica_projetos = mecanica_tubulacao + mecanica_lancas + mecanica_venda
    for p in mecanica_projetos:
        criar_alocacao(
            ENGENHARIA_MECANICA,
            p['id'],
            'engenheiro',
            p['data_inicio_prevista'][:10] if p['data_inicio_prevista'] else '2026-01-01',
            p['data_fim_prevista'][:10] if p['data_fim_prevista'] else None,
            percentual=100
        )

    # 4. PINTURA - Thiago Alencar nos projetos de pintura
    print("\n=== PINTURA (Thiago Alencar) ===")
    for p in mecanica_pintura:
        criar_alocacao(
            PINTURA,
            p['id'],
            'coordenador',
            p['data_inicio_prevista'][:10] if p['data_inicio_prevista'] else '2026-01-01',
            p['data_fim_prevista'][:10] if p['data_fim_prevista'] else None,
            percentual=100
        )

    # 5. COMPRAS - dividir entre Jefferson e Leandro
    print("\n=== COMPRAS ===")
    for i, p in enumerate(todos_projetos):
        compras_id = COMPRAS[i % 2]
        criar_alocacao(
            compras_id,
            p['id'],
            'comprador',
            p['data_inicio_prevista'][:10] if p['data_inicio_prevista'] else '2026-01-01',
            p['data_fim_prevista'][:10] if p['data_fim_prevista'] else None,
            percentual=20  # compras participa parcialmente
        )

    # 6. ASSISTENTES - dividir entre Larissa, Leticia e Vinicius
    print("\n=== ASSISTENTES ===")
    for i, p in enumerate(todos_projetos):
        assistente_id = ASSISTENTES[i % 3]
        criar_alocacao(
            assistente_id,
            p['id'],
            'auxiliar',
            p['data_inicio_prevista'][:10] if p['data_inicio_prevista'] else '2026-01-01',
            p['data_fim_prevista'][:10] if p['data_fim_prevista'] else None,
            percentual=40  # assistentes dividem tempo
        )

    print("\n=== CONCLUIDO ===")
    # Verificar total de alocacoes
    r = requests.get(f"{API_BASE}/alocacoes/")
    print(f"Total de alocacoes criadas: {len(r.json())}")

if __name__ == "__main__":
    main()
