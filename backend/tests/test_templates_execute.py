from app.services.code_generator import code_generator
from app.simulator.code_executor import CodeExecutor
from app.simulator.microbit_sim import MicrobitSimulator
from app.simulator.nezha_sim import NezhaSimulator


def test_all_code_templates_execute_in_local_simulator_subset():
    failures = []

    for template in code_generator.list_templates():
        microbit = MicrobitSimulator(template.id)
        nezha = NezhaSimulator(template.id) if template.platform.value == "nezha" else None
        result = CodeExecutor(microbit, nezha).execute_code(template.code, max_iterations=2)
        if not result["success"]:
            failures.append(f"{template.id}: {result['error']}")

    assert failures == []
