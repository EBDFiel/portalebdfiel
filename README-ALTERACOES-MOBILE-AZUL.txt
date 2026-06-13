Alterações realizadas em 13/06/2026

1. Tema visual azul neutro
- Adicionado arquivo css/blue-mobile-theme.css.
- Aplicado visual em tons de azul no topo, hero, botões, cards, menus, podcasts, aulas e rodapé.
- Mantida a estrutura original do site, incluindo Firebase, PWA, lições, vídeos, podcasts e painel/admin.

2. Otimização mobile
- Ajuste do viewport para permitir zoom e melhor comportamento em celulares.
- Menu mobile com melhor espaçamento, rolagem interna e áreas de toque maiores.
- Botões em largura total no celular.
- Cards, hero, podcast, vídeos e lições ajustados para telas pequenas.
- Redução de risco de estouro horizontal.
- Melhor suporte a safe-area em celulares modernos.

3. Performance/PWA
- Atualizado theme_color do manifesto para azul.
- Atualizada versão do service worker para forçar renovação do cache.
- Incluído o novo CSS no cache do app.
- Removidas imagens grandes de fundo do cache inicial do PWA.
- No mobile, fundos grandes das seções de classe são substituídos por gradiente azul para carregar mais leve.

Arquivos principais alterados:
- index.html
- licao.html
- manifest.json
- offline.html
- service-worker.js
- css/blue-mobile-theme.css
