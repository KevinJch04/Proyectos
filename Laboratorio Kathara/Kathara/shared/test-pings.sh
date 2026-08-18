#!/bin/bash

dns_server="ha1.chipana.izo"
domain="chipana.izo"

# Obtener lista de hosts con registro A, y quitar el punto final (chipana.izo".")
hosts=$(dig @${dns_server} ${domain} AXFR | awk '$4=="A"{print $1}' | sed 's/\.$//')

echo "Probando ping a todos los hosts de ${domain}..."
echo ""

for h in $hosts; do
    fqdn="${h}"
    ip=$(dig +short @${dns_server} $fqdn)

    if ping -c1 -W1 "$fqdn" > /dev/null 2>&1; then
        echo "[OK] $fqdn ($ip)"
    else
        echo "[FAIL] $fqdn ($ip)"
    fi
done
