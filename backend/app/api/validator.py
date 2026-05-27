from fastapi import APIRouter
from app.schemas.requirement import RequirementCreate, HardwareAlgorithmRequest
from app.core.contradiction_detector import ContradictionDetector

router = APIRouter(prefix="/api/validator", tags=["矛盾检测"])
detector = ContradictionDetector()

@router.post("/requirement", summary="检测需求中的矛盾")
def validate_requirement(requirement: RequirementCreate):
    contradictions = detector.check_requirement(requirement)
    return {
        "valid": len([c for c in contradictions if c.get("severity") in ["critical", "error"]]) == 0,
        "contradictions": contradictions,
        "total_issues": len(contradictions),
        "critical_count": len([c for c in contradictions if c.get("severity") == "critical"]),
        "warning_count": len([c for c in contradictions if c.get("severity") == "warning"]),
    }

@router.post("/hardware-algorithm", summary="检测硬件与算法需求的矛盾")
def validate_hardware_algorithm(request: HardwareAlgorithmRequest):
    contradictions = detector.check_hardware_algorithm(request.hardware_info, request.desired_functions)
    return {
        "valid": len([c for c in contradictions if c.get("severity") in ["critical", "error"]]) == 0,
        "contradictions": contradictions,
        "total_issues": len(contradictions),
        "critical_count": len([c for c in contradictions if c.get("severity") == "critical"]),
        "warning_count": len([c for c in contradictions if c.get("severity") == "warning"]),
    }
