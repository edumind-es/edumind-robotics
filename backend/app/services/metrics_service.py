#
# Copyright (C) 2024-2025 EDUmind - Los Mundos Edufis
# Author: Luis Vilela Acuña
#

"""
Metrics Service - Application metrics for monitoring (Robotics).
Provides Prometheus-compatible metrics.
"""
import time
from datetime import datetime
from collections import defaultdict
import threading
from typing import Dict, Any

class MetricsCollector:
    """Simple in-memory metrics collector."""
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self._initialized = True
        self._start_time = datetime.utcnow()
        self.request_counts: Dict[str, int] = defaultdict(int)
        self.error_counts: Dict[str, int] = defaultdict(int)
        
    def record_request(self, endpoint: str, status_code: int):
        self.request_counts[endpoint] += 1
        if status_code >= 400:
            self.error_counts[endpoint] += 1
            
    def get_metrics(self) -> Dict[str, Any]:
        uptime = datetime.utcnow() - self._start_time
        return {
            "uptime_seconds": int(uptime.total_seconds()),
            "requests": dict(self.request_counts),
            "errors": dict(self.error_counts)
        }
    
    def get_prometheus_metrics(self) -> str:
        lines = []
        lines.append(f'robotics_uptime_seconds {int((datetime.utcnow() - self._start_time).total_seconds())}')
        for endpoint, count in self.request_counts.items():
            safe_ep = endpoint.replace("/", "_").replace("-", "_")
            lines.append(f'robotics_requests_total{{endpoint="{safe_ep}"}} {count}')
        return "\n".join(lines)

metrics = MetricsCollector()
