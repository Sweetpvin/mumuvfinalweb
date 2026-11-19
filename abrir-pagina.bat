@echo off
REM Abre la pagina MUMU con un servidor local para que funcionen
REM los modelos 3D, el carrusel y el menu.
REM Para cerrarla, cierra esta ventana negra.
cd /d "%~dp0"
start "" http://localhost:5173
python -m http.server 5173
