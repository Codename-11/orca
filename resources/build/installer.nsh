# Axiom fork installer process isolation.
#
# electron-builder's default CHECK_APP_RUNNING macro treats *any* process whose
# executable path starts with $INSTDIR as the app. That is convenient for normal
# updates, but it is too broad for a side-by-side fork: if a stale/incorrect
# install location ever overlaps upstream Orca, the installer can report
# "Axiom Orca is running" even though the process is not the Axiom executable.
#
# Keep the close/update behavior for real Axiom updates, but only match the
# exact executable path that this installer owns: $INSTDIR\Axiom Orca.exe.

!macro AXIOM_FIND_APP_PROCESS _RETURN
  nsExec::Exec `"$PowerShellPath" -NoProfile -ExecutionPolicy Bypass -Command "$$target = (Join-Path '$INSTDIR' '${APP_EXECUTABLE_FILENAME}'); $$matches = @(Get-CimInstance -ClassName Win32_Process | Where-Object { $$_.Path -and [string]::Equals($$_.Path, $$target, [System.StringComparison]::CurrentCultureIgnoreCase) }); if ($$matches.Count -gt 0) { exit 0 } else { exit 1 }"`
  Pop ${_RETURN}
!macroend

!macro AXIOM_KILL_APP_PROCESS _FORCE
  Push $0
  ${if} ${_FORCE} == 1
    StrCpy $0 "-Force"
  ${else}
    StrCpy $0 ""
  ${endIf}

  nsExec::Exec `"$PowerShellPath" -NoProfile -ExecutionPolicy Bypass -Command "$$target = (Join-Path '$INSTDIR' '${APP_EXECUTABLE_FILENAME}'); Get-CimInstance -ClassName Win32_Process | Where-Object { $$_.Path -and [string]::Equals($$_.Path, $$target, [System.StringComparison]::CurrentCultureIgnoreCase) } | ForEach-Object { Stop-Process -Id $$_.ProcessId $0 }"`
  Pop $0
!macroend

!macro customCheckAppRunning
  ${if} ${isUpdated}
    # allow app to exit without explicit kill
    Sleep 300
  ${endIf}

  !insertmacro AXIOM_FIND_APP_PROCESS $R0
  ${if} $R0 == 0
    ${if} ${isUpdated}
      # allow app to exit without explicit kill
      Sleep 1000
      Goto axiomDoStopProcess
    ${endIf}
    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION "$(appRunning)" /SD IDOK IDOK axiomDoStopProcess
    Quit

    axiomDoStopProcess:

    DetailPrint "$(appClosing)"

    !insertmacro AXIOM_KILL_APP_PROCESS 0
    # to ensure that files are not "in-use"
    Sleep 300

    # Retry counter
    StrCpy $R1 0

    axiomLoop:
      IntOp $R1 $R1 + 1

      !insertmacro AXIOM_FIND_APP_PROCESS $R0
      ${if} $R0 == 0
        # wait to give a chance to exit gracefully
        Sleep 1000
        !insertmacro AXIOM_KILL_APP_PROCESS 1
        !insertmacro AXIOM_FIND_APP_PROCESS $R0
        ${if} $R0 == 0
          DetailPrint `Waiting for "${PRODUCT_NAME}" to close.`
          Sleep 2000
        ${else}
          Goto axiomNotRunning
        ${endIf}
      ${else}
        Goto axiomNotRunning
      ${endIf}

      # App likely running with elevated permissions.
      # Ask user to close it manually.
      ${if} $R1 > 1
        MessageBox MB_RETRYCANCEL|MB_ICONEXCLAMATION "$(appCannotBeClosed)" /SD IDCANCEL IDRETRY axiomLoop
        Quit
      ${else}
        Goto axiomLoop
      ${endIf}
    axiomNotRunning:
  ${endIf}
!macroend

; Clean up the relocated terminal daemon on a REAL uninstall.
;
; Why: the daemon host is deliberately copied to a distinct image name
; (orca-terminal-daemon.exe) under %LOCALAPPDATA%\Orca\daemon-host so app
; UPDATES cannot kill it. A real uninstall must clean up the orphanable host,
; while ${isUpdated} keeps normal updates terminal-safe.
!macro customUnInstall
  ${ifNot} ${isUpdated}
    nsExec::Exec 'taskkill /F /IM orca-terminal-daemon.exe'
    ; Give the OS a moment to release the image lock before removing the tree.
    Sleep 500
    RMDir /r "$LOCALAPPDATA\Orca\daemon-host"
  ${endIf}
!macroend
