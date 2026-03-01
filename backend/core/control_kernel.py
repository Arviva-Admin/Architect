"""Control Kernel - Immutable control layer for the ACCF system"""
import logging
from enum import Enum
from typing import Dict, Any, Optional
from datetime import datetime, timezone
import uuid

logger = logging.getLogger(__name__)

class AutonomyLevel(str, Enum):
    """Autonomy levels A0-A4"""
    A0 = "A0"  # Manual approval for every action
    A1 = "A1"  # Execute with confirmation
    A2 = "A2"  # Execute with post-notification
    A3 = "A3"  # Autonomous with periodic reports
    A4 = "A4"  # Full autonomy with rollback capability

class ExecutionStatus(str, Enum):
    """Execution status states"""
    PENDING = "pending"
    APPROVED = "approved"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"

class ControlKernel:
    """Immutable control layer that enforces safety and autonomy policies"""
    
    def __init__(self):
        self.version = "1.0.0"
        self.status = "active"
        self.autonomy_level = AutonomyLevel.A2
        self.safety_policies = self._init_safety_policies()
        self.execution_log = []
        logger.info(f"Control Kernel v{self.version} initialized")
    
    def _init_safety_policies(self) -> Dict[str, Any]:
        """Initialize default safety policies"""
        return {
            "max_execution_time": 300,  # 5 minutes
            "require_rollback_point": True,
            "shadow_simulation_required": True,
            "max_resource_usage": {
                "memory_mb": 35000,  # 35GB
                "cpu_percent": 80
            },
            "forbidden_operations": [
                "rm_rf_root",
                "unrestricted_network_access",
                "kernel_modification"
            ]
        }
    
    def set_autonomy_level(self, level: AutonomyLevel) -> Dict[str, Any]:
        """Set autonomy level with validation"""
        old_level = self.autonomy_level
        self.autonomy_level = level
        
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": "autonomy_level_change",
            "old_level": old_level,
            "new_level": level,
            "operator": "system"
        }
        self.execution_log.append(log_entry)
        
        logger.info(f"Autonomy level changed: {old_level} -> {level}")
        
        return {
            "success": True,
            "old_level": old_level,
            "new_level": level,
            "timestamp": log_entry["timestamp"]
        }
    
    def validate_operation(self, operation: Dict[str, Any]) -> Dict[str, Any]:
        """Validate operation against safety policies"""
        operation_id = str(uuid.uuid4())
        operation_type = operation.get("type", "unknown")
        
        # Check forbidden operations
        if operation_type in self.safety_policies["forbidden_operations"]:
            return {
                "valid": False,
                "operation_id": operation_id,
                "reason": f"Operation '{operation_type}' is forbidden by safety policy",
                "requires_approval": False
            }
        
        # Check autonomy level requirements
        requires_approval = self._requires_approval(operation_type)
        requires_simulation = self.safety_policies["shadow_simulation_required"]
        
        return {
            "valid": True,
            "operation_id": operation_id,
            "requires_approval": requires_approval,
            "requires_simulation": requires_simulation,
            "autonomy_level": self.autonomy_level,
            "estimated_risk": self._assess_risk(operation)
        }
    
    def _requires_approval(self, operation_type: str) -> bool:
        """Determine if operation requires manual approval based on autonomy level"""
        if self.autonomy_level == AutonomyLevel.A0:
            return True
        elif self.autonomy_level == AutonomyLevel.A1:
            return operation_type in ["code_modification", "system_change"]
        elif self.autonomy_level == AutonomyLevel.A2:
            return operation_type in ["critical_system_change"]
        else:
            return False
    
    def _assess_risk(self, operation: Dict[str, Any]) -> str:
        """Assess risk level of operation"""
        operation_type = operation.get("type", "unknown")
        scope = operation.get("scope", "local")
        
        if operation_type in ["system_modification", "kernel_update"]:
            return "high"
        elif operation_type in ["code_modification", "config_change"]:
            return "medium" if scope == "global" else "low"
        else:
            return "low"
    
    def log_execution(self, operation_id: str, status: ExecutionStatus, details: Dict[str, Any]):
        """Log operation execution"""
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "operation_id": operation_id,
            "status": status,
            "details": details,
            "autonomy_level": self.autonomy_level
        }
        self.execution_log.append(log_entry)
        logger.info(f"Operation {operation_id}: {status}")
    
    def get_status(self) -> Dict[str, Any]:
        """Get control kernel status"""
        return {
            "version": self.version,
            "status": self.status,
            "autonomy_level": self.autonomy_level,
            "safety_policies": self.safety_policies,
            "execution_log_size": len(self.execution_log),
            "uptime": "active"
        }

# Global instance
control_kernel = ControlKernel()
