#! /usr/bin/env bash
set -e

IMAGE="srf-meteo-exporter"
VERSION=$(cat package.json | jq -r .version)

docker build --platform linux/amd64 -t "simonalbrecht/${IMAGE}:latest" -t "simonalbrecht/${IMAGE}:${VERSION}" .
docker tag "simonalbrecht/${IMAGE}:latest" "ghcr.io/simonalbrecht/${IMAGE}:latest"
docker tag "simonalbrecht/${IMAGE}:${VERSION}" "ghcr.io/simonalbrecht/${IMAGE}:${VERSION}"
