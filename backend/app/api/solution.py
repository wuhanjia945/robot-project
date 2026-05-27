from fastapi import APIRouter
from app.schemas.requirement import RequirementCreate
from app.schemas.solution import SolutionResponse
from app.core.solution_generator import SolutionGenerator

router = APIRouter(prefix="/api/solution", tags=["方案生成"])
generator = SolutionGenerator()

@router.post("/generate", response_model=SolutionResponse, summary="根据需求生成技术方案")
def generate_solution(requirement: RequirementCreate):
    solution = generator.generate(requirement)
    return solution
