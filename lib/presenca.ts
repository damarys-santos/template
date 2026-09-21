// lib/presenca.ts
// Constante compartilhada com TODO sistema que escreve em
// `usuario_sistema.ultimo_acesso` (tabela do schema `public`, compartilhada
// entre todos os sistemas do core). Ver AGENTS.md ("Presença online").
//
// Esse sistema é um sistema-filho: só ESCREVE o heartbeat (getSessionPayload
// + logout). A LEITURA/contagem (`ONLINE_WINDOW_MS`, endpoint, polling,
// badge) é exclusiva do Core — não precisa e não deve ser portada aqui.

// Intervalo mínimo entre dois pings do mesmo usuário no mesmo sistema.
export const HEARTBEAT_THROTTLE_MS = 60_000;
