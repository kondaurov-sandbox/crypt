#!/bin/bash

set -e

redis-server --daemonize yes --protected-mode no

pm2 start ecosystem.yaml