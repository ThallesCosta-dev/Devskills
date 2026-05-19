@echo off
cd /d "%~dp0"
title DevSkills Full Stack Starter
cls
echo ====================================================================
echo                   DEV SKILLS - FULL STACK STARTER                   
echo ====================================================================
echo.
echo Este script vai iniciar o Backend (Spring Boot), o Frontend (React/Vite)
echo e o Scraper de Vagas do Mercado Inteligente.
echo.
echo Requisitos:
echo - Java 17+ instalado
echo - Maven instalado - comando 'mvn' disponivel no PATH
echo - Node.js instalado - comando 'npm' e 'node' disponiveis no PATH
echo.
echo ====================================================================
echo.

:: Carregar variaveis do .env
echo [0/3] Carregando variaveis de ambiente do .env...
for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
    if not "%%a"=="" if not "%%a:~0,1%"=="#" (
        set "%%a=%%b"
    )
)
echo     OK - Variaveis carregadas.
echo.

:: Verificar se mvn esta instalado
where mvn >nul 2>nul
if errorlevel 1 (
    echo [ERRO] Maven - comando 'mvn' - nao foi encontrado no PATH do seu sistema.
    echo Certifique-se de instalar o Maven ou rodar o backend diretamente pela sua IDE.
    goto error
)

:: Verificar se npm esta instalado
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERRO] Node.js - comando 'npm' - nao foi encontrado no PATH do seu sistema.
    goto error
)

echo [1/3] Iniciando o Backend Spring Boot em uma nova janela...
start "DevSkills Backend" cmd /k "echo Iniciando Spring Boot com Maven... && mvn spring-boot:run"

echo [2/3] Aguardando o Backend iniciar (30s) para depois rodar o scraper...
timeout /t 30 /nobreak >nul
echo     Executando scraper de vagas do Mercado Inteligente...
start "DevSkills Scraper" cmd /k "node frontend\scraper\job-scraper.cjs && echo Scraper concluido! && timeout /t 10"

echo [3/3] Iniciando o Frontend React...
cd frontend
echo Rodando 'npm run dev' no frontend...
npm run dev

:error
pause
