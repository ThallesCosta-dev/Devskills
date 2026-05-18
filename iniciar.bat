@echo off
cd /d "%~dp0"
title DevSkills Full Stack Starter
cls
echo ====================================================================
echo                   DEV SKILLS - FULL STACK STARTER                   
echo ====================================================================
echo.
echo Este script vai iniciar o Backend (Spring Boot) e o Frontend (React/Vite).
echo.
echo Requisitos:
echo - Java 17+ instalado
echo - Maven instalado - comando 'mvn' disponivel no PATH
echo - Node.js instalado - comando 'npm' disponivel no PATH
echo.
echo ====================================================================
echo.

:: Verificar se mvn está instalado
where mvn >nul 2>nul
if errorlevel 1 (
    echo [ERRO] Maven - comando 'mvn' - nao foi encontrado no PATH do seu sistema.
    echo Certifique-se de instalar o Maven ou rodar o backend diretamente pela sua IDE.
    goto error
)

:: Verificar se npm está instalado
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERRO] Node.js - comando 'npm' - nao foi encontrado no PATH do seu sistema.
    goto error
)

echo [1/2] Iniciando o Backend Spring Boot em uma nova janela...
start "DevSkills Backend" cmd /k "echo Iniciando Spring Boot com Maven... && mvn spring-boot:run"

echo [2/2] Iniciando o Frontend React...
cd frontend
echo Rodando 'npm run dev' no frontend...
npm run dev

:error
pause
