#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
ensure_env

ps_cid="${1:-$(compose_cmd ps -q prestashop)}"
if [[ -z "${ps_cid}" ]]; then
  echo "Nie znaleziono kontenera prestashop. Uruchom ./scripts/up.sh lub ./scripts/theme-apply.sh" >&2
  exit 1
fi

require_cmd() { command -v "$1" >/dev/null 2>&1 || return 1; }
install_tools() {
  local missing=()
  for cmd in curl sha256sum cwebp convert python3; do
    require_cmd "$cmd" || missing+=("$cmd")
  done
  if ((${#missing[@]})); then
    if command -v apt-get >/dev/null 2>&1; then
      sudo apt-get update
      sudo apt-get install -y curl webp imagemagick python3 coreutils
    else
      echo "Brakuje narzędzi: ${missing[*]}" >&2
      exit 1
    fi
  fi
}

install_tools

manifest_src="${INFRA_DIR}/theme/forestcatering-premium/assets.sources.json"
manifest_out="${INFRA_DIR}/theme/forestcatering-premium/assets-manifest.json"
sources_out="${INFRA_DIR}/theme/forestcatering-premium/SOURCES.md"

if [[ ! -f "${manifest_src}" ]]; then
  echo "Brak pliku ${manifest_src}" >&2
  exit 1
fi

tmp_dir="$(mktemp -d)"
trap 'rm -rf "${tmp_dir}"' EXIT

python3 - <<'PY' "${manifest_src}" "${tmp_dir}/assets.tsv"
import json,sys
src,out=sys.argv[1],sys.argv[2]
data=json.load(open(src))
with open(out,'w',encoding='utf-8') as f:
    for i in data['images']:
        f.write('\t'.join([i['id'],i['url'],i['sha256'],i['license'],i['author']])+'\n')
PY

mkdir -p "${tmp_dir}/raw" "${tmp_dir}/webp"
while IFS=$'\t' read -r id url sha license author; do
  raw="${tmp_dir}/raw/${id}.bin"
  curl -fsSL --retry 4 --retry-delay 2 -A 'ForestCateringAssetsInstaller/1.0' "${url}" -o "${raw}"
  got="$(sha256sum "${raw}" | awk '{print $1}')"
  if [[ "${got}" != "${sha}" ]]; then
    echo "Checksum mismatch dla ${id}. Oczekiwano ${sha}, otrzymano ${got}" >&2
    exit 1
  fi
  cwebp -q 84 -resize 1600 0 "${raw}" -o "${tmp_dir}/webp/${id}.webp" >/dev/null
  identify -format '%wx%h' "${tmp_dir}/webp/${id}.webp" > "${tmp_dir}/webp/${id}.size"
done < "${tmp_dir}/assets.tsv"

container_img_dir="/var/www/html/themes/forestcatering-premium/assets/img"
docker exec "${ps_cid}" mkdir -p "${container_img_dir}"
docker cp "${tmp_dir}/webp/." "${ps_cid}:${container_img_dir}/"

python3 - <<'PY' "${tmp_dir}/assets.tsv" "${tmp_dir}/webp" "${manifest_out}"
import json,sys,hashlib,pathlib
rows=[l.strip('\n').split('\t') for l in open(sys.argv[1],encoding='utf-8') if l.strip()]
webp_dir=pathlib.Path(sys.argv[2]); out=pathlib.Path(sys.argv[3])
items=[]
for id,url,sha,lic,author in rows:
    f=webp_dir/f"{id}.webp"
    size=open(webp_dir/f"{id}.size",encoding='utf-8').read().strip()
    items.append({"id":id,"source_url":url,"source_sha256":sha,"webp_sha256":hashlib.sha256(f.read_bytes()).hexdigest(),"webp_size":size,"path":f"assets/img/{id}.webp"})
out.write_text(json.dumps({"generated_at":"deterministic","items":items},ensure_ascii=False,indent=2)+"\n",encoding='utf-8')
PY

{
  echo "# Źródła zasobów graficznych ForestCatering Premium"
  echo
  echo "Wszystkie zdjęcia pobierane są automatycznie przez \\`infra/scripts/theme-assets-install.sh\\`."
  echo "Skrypt wymusza zgodność SHA-256 i przerywa działanie przy dowolnej niezgodności."
  echo
  echo "| ID | Autor | Licencja | URL |"
  echo "|---|---|---|---|"
  while IFS=$'\t' read -r id url _sha license author; do
    echo "| ${id} | ${author} | ${license} | ${url} |"
  done < "${tmp_dir}/assets.tsv"
} > "${sources_out}"

echo "Zainstalowano zasoby graficzne dla motywu forestcatering-premium"
