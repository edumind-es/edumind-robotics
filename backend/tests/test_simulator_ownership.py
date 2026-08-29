from app.simulator.simulator_manager import SimulatorManager


def test_simulator_sessions_are_scoped_to_their_owner():
    manager = SimulatorManager()
    alice_session = manager.create_session("micro:bit", "alice")
    bob_session = manager.create_session("micro:bit", "bob")

    assert manager.get_session(alice_session, "alice") is not None
    assert manager.get_session(alice_session, "bob") is None
    assert set(manager.get_all_sessions("alice")) == {alice_session}
    assert set(manager.get_all_sessions("bob")) == {bob_session}
    assert manager.delete_session(alice_session, "bob") is False
    assert manager.delete_session(alice_session, "alice") is True
