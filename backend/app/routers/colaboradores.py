"""
Endpoints de Colaboradores
"""
from typing import Set
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Colaborador, Setor, NivelHierarquico, Subnivel
from ..schemas import ColaboradorCreate, ColaboradorUpdate, ColaboradorResponse

router = APIRouter(prefix="/colaboradores", tags=["Colaboradores"])


def check_hierarchy_cycle(
    db: Session,
    colaborador_id: int,
    new_superior_id: int | None,
    visited: Set[int] | None = None
) -> bool:
    """
    Verifica se atribuir new_superior_id como superior de colaborador_id criaria um ciclo.

    Retorna True se um ciclo seria criado, False caso contrário.

    Exemplo de ciclo:
    - A é superior de B
    - B é superior de C
    - Tentar fazer C superior de A criaria ciclo: A -> B -> C -> A
    """
    if new_superior_id is None:
        return False

    # Não pode ser seu próprio superior
    if colaborador_id == new_superior_id:
        return True

    if visited is None:
        visited = set()

    # Verifica se o novo superior já está na cadeia de subordinação
    # Ou seja, se new_superior_id é subordinado (direto ou indireto) de colaborador_id
    current_id = new_superior_id
    while current_id is not None:
        if current_id in visited:
            return True  # Ciclo detectado
        if current_id == colaborador_id:
            return True  # Novo superior é subordinado do colaborador

        visited.add(current_id)
        superior = db.query(Colaborador).filter(Colaborador.id == current_id).first()
        if superior is None:
            break
        current_id = superior.superior_id

    return False


@router.get("/", response_model=list[ColaboradorResponse])
def list_colaboradores(
    setor_id: int | None = Query(None, description="Filtrar por setor"),
    nivel_id: int | None = Query(None, description="Filtrar por nível"),
    db: Session = Depends(get_db),
):
    """Lista todos os colaboradores com filtros opcionais"""
    query = db.query(Colaborador)

    if setor_id:
        query = query.filter(Colaborador.setor_id == setor_id)
    if nivel_id:
        query = query.filter(Colaborador.nivel_id == nivel_id)

    return query.all()


@router.get("/{colaborador_id}", response_model=ColaboradorResponse)
def get_colaborador(colaborador_id: int, db: Session = Depends(get_db)):
    """Busca um colaborador por ID"""
    colaborador = db.query(Colaborador).filter(Colaborador.id == colaborador_id).first()
    if not colaborador:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    return colaborador


@router.post("/", response_model=ColaboradorResponse, status_code=201)
def create_colaborador(colaborador: ColaboradorCreate, db: Session = Depends(get_db)):
    """Cria um novo colaborador"""
    # Validar setor_id
    setor = db.query(Setor).filter(Setor.id == colaborador.setor_id).first()
    if not setor:
        raise HTTPException(
            status_code=400,
            detail=f"Setor com ID {colaborador.setor_id} não encontrado"
        )

    # Validar nivel_id
    nivel = db.query(NivelHierarquico).filter(NivelHierarquico.id == colaborador.nivel_id).first()
    if not nivel:
        raise HTTPException(
            status_code=400,
            detail=f"Nível hierárquico com ID {colaborador.nivel_id} não encontrado"
        )

    # Validar subnivel_id se especificado
    if colaborador.subnivel_id is not None:
        subnivel = db.query(Subnivel).filter(Subnivel.id == colaborador.subnivel_id).first()
        if not subnivel:
            raise HTTPException(
                status_code=400,
                detail=f"Subnível com ID {colaborador.subnivel_id} não encontrado"
            )

        # Verificar se o subnível pertence ao nível hierárquico correto
        if subnivel.nivel_id != colaborador.nivel_id:
            raise HTTPException(
                status_code=400,
                detail=f"Subnível {subnivel.nome} não pertence ao nível hierárquico selecionado"
            )

    # Validar que o superior existe (se especificado)
    if colaborador.superior_id is not None:
        superior = db.query(Colaborador).filter(Colaborador.id == colaborador.superior_id).first()
        if not superior:
            raise HTTPException(
                status_code=400,
                detail=f"Superior com ID {colaborador.superior_id} não encontrado"
            )

    db_colaborador = Colaborador(**colaborador.model_dump())
    db.add(db_colaborador)
    db.commit()
    db.refresh(db_colaborador)
    return db_colaborador


@router.put("/{colaborador_id}", response_model=ColaboradorResponse)
def update_colaborador(
    colaborador_id: int,
    colaborador: ColaboradorUpdate,
    db: Session = Depends(get_db),
):
    """Atualiza um colaborador"""
    db_colaborador = db.query(Colaborador).filter(Colaborador.id == colaborador_id).first()
    if not db_colaborador:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")

    update_data = colaborador.model_dump(exclude_unset=True)

    # Validar setor_id se está sendo alterado
    if "setor_id" in update_data:
        setor_id = update_data["setor_id"]
        if setor_id is not None:
            setor = db.query(Setor).filter(Setor.id == setor_id).first()
            if not setor:
                raise HTTPException(
                    status_code=400,
                    detail=f"Setor com ID {setor_id} não encontrado"
                )

    # Validar nivel_id se está sendo alterado
    if "nivel_id" in update_data:
        nivel_id = update_data["nivel_id"]
        if nivel_id is not None:
            nivel = db.query(NivelHierarquico).filter(NivelHierarquico.id == nivel_id).first()
            if not nivel:
                raise HTTPException(
                    status_code=400,
                    detail=f"Nível hierárquico com ID {nivel_id} não encontrado"
                )

    # Validar subnivel_id se está sendo alterado
    if "subnivel_id" in update_data:
        subnivel_id = update_data["subnivel_id"]
        if subnivel_id is not None:
            # Determinar qual nivel_id usar (novo ou atual)
            nivel_id = update_data.get("nivel_id", db_colaborador.nivel_id)

            # Verificar se o subnível existe
            subnivel = db.query(Subnivel).filter(Subnivel.id == subnivel_id).first()
            if not subnivel:
                raise HTTPException(
                    status_code=400,
                    detail=f"Subnível com ID {subnivel_id} não encontrado"
                )

            # Verificar se o subnível pertence ao nível hierárquico correto
            if subnivel.nivel_id != nivel_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Subnível {subnivel.nome} não pertence ao nível hierárquico selecionado"
                )

    # Validação anti-ciclo se superior_id está sendo alterado
    if "superior_id" in update_data:
        new_superior_id = update_data["superior_id"]

        # Validar que o superior existe (se especificado)
        if new_superior_id is not None:
            superior = db.query(Colaborador).filter(Colaborador.id == new_superior_id).first()
            if not superior:
                raise HTTPException(
                    status_code=400,
                    detail=f"Superior com ID {new_superior_id} não encontrado"
                )

            # Validação anti-ciclo
            if check_hierarchy_cycle(db, colaborador_id, new_superior_id):
                raise HTTPException(
                    status_code=400,
                    detail="Alteração criaria ciclo na hierarquia. O superior especificado é subordinado deste colaborador."
                )

    for field, value in update_data.items():
        setattr(db_colaborador, field, value)

    db.commit()
    db.refresh(db_colaborador)
    return db_colaborador


@router.delete("/{colaborador_id}", status_code=204)
def delete_colaborador(colaborador_id: int, db: Session = Depends(get_db)):
    """Remove um colaborador"""
    db_colaborador = db.query(Colaborador).filter(Colaborador.id == colaborador_id).first()
    if not db_colaborador:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")

    db.delete(db_colaborador)
    db.commit()


@router.get("/{colaborador_id}/subordinados", response_model=list[ColaboradorResponse])
def list_subordinados(colaborador_id: int, db: Session = Depends(get_db)):
    """Lista subordinados diretos de um colaborador"""
    return db.query(Colaborador).filter(Colaborador.superior_id == colaborador_id).all()
