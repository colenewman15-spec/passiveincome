@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0run_factory.ps1" %*
if errorlevel 1 pause