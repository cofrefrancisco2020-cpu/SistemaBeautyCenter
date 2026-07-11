# Deploy Vercel

Proyecto Vercel esperado: `beautycenter-system`

URL usada en pruebas:

- https://systembeautycenter.vercel.app

Repositorio GitHub:

- https://github.com/cofrefrancisco2020-cpu/SistemaBeautyCenter

## Configuracion esperada

```txt
Framework Preset: Vite
Build Command: pnpm run build
Output Directory: dist
Install Command: pnpm install
```

Variables obligatorias:

```env
VITE_SUPABASE_URL=https://vwsqkhfrvcfzldwfvvrg.supabase.co
VITE_SUPABASE_ANON_KEY=PEGAR_ANON_PUBLIC_KEY
```

## Como saber si el deploy esta bien

La version correcta no debe servir `./app.js?v=...` directo.

Correcto:

- `index.html` carga `/assets/index-xxxxx.js`;
- el JavaScript final esta minificado;
- no hay archivos `.map` publicados;
- al crear datos y abrir incognito, los datos siguen apareciendo.

Incorrecto:

- `index.html` carga `./app.js?v=...`;
- `/app.js` importa solo `./adapters/localStorageAdapter.js`;
- los cambios aparecen solo en la misma ventana del navegador.

## Nota operativa

- Cada push a `main` deberia activar un nuevo despliegue en Vercel.
- Si Vercel no despliega automatico, hacer redeploy manual desde el dashboard.
- Antes de entregar al cliente, ejecutar la prueba de incognito descrita en `docs/checklist-entrega-real.md`.
