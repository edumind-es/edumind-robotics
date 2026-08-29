import os


# Unit tests exercise application behavior without depending on the live IdP.
os.environ["AUTHENTIK_ENABLED"] = "false"
