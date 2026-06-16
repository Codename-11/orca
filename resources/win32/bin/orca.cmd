@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "RESOURCES_DIR=%%~fI"
REM Why: once %%~fI canonicalizes RESOURCES_DIR it no longer ends with a slash,
REM so Windows batch needs an explicit "\.." segment here. Without it the CLI
REM launcher resolves APP_DIR back to resources/ and `orca open` cannot find the
REM packaged app executable on Windows installs.
for %%I in ("%RESOURCES_DIR%\..") do set "APP_DIR=%%~fI"
set "ELECTRON_EXE=Orca.exe"
set "ELECTRON_NAME_FILE=%RESOURCES_DIR%\orca-electron-executable.txt"
if exist "%ELECTRON_NAME_FILE%" (
  set /p ELECTRON_EXE=<"%ELECTRON_NAME_FILE%"
)
set "ELECTRON=%APP_DIR%\%ELECTRON_EXE%"
set "USER_DATA_NAME=orca"
set "USER_DATA_NAME_FILE=%RESOURCES_DIR%\orca-user-data-name.txt"
if exist "%USER_DATA_NAME_FILE%" (
  set /p USER_DATA_NAME=<"%USER_DATA_NAME_FILE%"
)
REM Why: fork builds use Electron's package name as the userData directory.
REM Keep the CLI attached to the same runtime metadata as the packaged GUI.
if not defined ORCA_USER_DATA_PATH if defined APPDATA (
  set "ORCA_USER_DATA_PATH=%APPDATA%\%USER_DATA_NAME%"
)

if not exist "%ELECTRON%" (
  echo Unable to locate %ELECTRON_EXE% next to "%RESOURCES_DIR%" 1>&2
  exit /b 1
)

REM Why: Orca packages the CLI entrypoint outside app.asar so the public shell
REM command can execute it directly with ELECTRON_RUN_AS_NODE instead of
REM depending on a separately installed Node CLI.
set "CLI=%RESOURCES_DIR%\app.asar.unpacked\out\cli\index.js"

set "ORCA_NODE_OPTIONS=%NODE_OPTIONS%"
set "ORCA_NODE_REPL_EXTERNAL_MODULE=%NODE_REPL_EXTERNAL_MODULE%"
set NODE_OPTIONS=
set NODE_REPL_EXTERNAL_MODULE=
set ELECTRON_RUN_AS_NODE=1

"%ELECTRON%" "%CLI%" %*
