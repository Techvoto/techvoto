#!/usr/bin/env bash
# Render pre-deploy command: apply committed migrations after the new build is ready.
set -o errexit
python manage.py migrate --no-input
