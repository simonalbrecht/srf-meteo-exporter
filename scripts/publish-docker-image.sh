#! /usr/bin/env bash
set -e

IMAGE="srf-meteo-exporter"
VERSION=$(cat package.json | jq -r .version)

docker push "ghcr.io/simonalbrecht/${IMAGE}:latest"
docker push "ghcr.io/simonalbrecht/${IMAGE}:${VERSION}"