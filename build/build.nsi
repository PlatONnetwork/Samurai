; �ýű�ʹ�� HM VNISEdit �ű��༭���򵼲���

!include "LogicLib.nsh"

; ��װ�����ʼ���峣��
!define PRODUCT_NAME "Samurai"
!define PRODUCT_VERSION " 0.4.0.1"; �Ӱ汾�ţ���ͷ���һ���ո�
!define PRODUCT_PUBLISHER "www.platon.network<support@platon.network>"
!define PRODUCT_WEB_SITE "https://www.platon.network"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\Samurai.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKLM"

SetCompressor lzma

; ------ MUI �ִ����涨�� (1.67 �汾���ϼ���) ------
!include "MUI.nsh"

; MUI Ԥ���峣��
!define MUI_ABORTWARNING
!define MUI_ICON "icons\icon.ico"
!define MUI_UNICON "icons\icon.ico"
!define MUI_WELCOMEFINISHPAGE_BITMAP "icons\bg.bmp"

; ��ӭҳ��
!insertmacro MUI_PAGE_WELCOME
; ���Э��ҳ��
!define MUI_LICENSEPAGE_CHECKBOX
!insertmacro MUI_PAGE_LICENSE "softwareLicence.txt"
; ��װĿ¼ѡ��ҳ��
!insertmacro MUI_PAGE_DIRECTORY

Page custom SetCustom LeaveCustom  ;�Զ��崰�ڣ�ѡ������Ŀ¼
; ��װ����ҳ��
!insertmacro MUI_PAGE_INSTFILES
; ��װ���ҳ��
!define MUI_FINISHPAGE_RUN "$INSTDIR\Samurai.exe"
!insertmacro MUI_PAGE_FINISH

; ��װж�ع���ҳ��
!insertmacro MUI_UNPAGE_INSTFILES

; ��װ�����������������

!insertmacro MUI_LANGUAGE "English"


; ��װԤ�ͷ��ļ�
!insertmacro MUI_RESERVEFILE_INSTALLOPTIONS
; ------ MUI �ִ����涨����� ------

Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "..\dist\${PRODUCT_NAME}-windows-amd64${PRODUCT_VERSION}.exe"
InstallDir "$PROGRAMFILES\Samurai"
InstallDirRegKey HKLM "${PRODUCT_UNINST_KEY}" "UninstallString"
ShowInstDetails show
ShowUnInstDetails show

; ���װ��־��¼������־�ļ�������Ϊж���ļ�������(ע�⣬�����α����������������֮ǰ)
Section "-LogSetOn"
  LogSet on
SectionEnd

Section "Samurai"
ReadRegStr $R2 HKLM "${PRODUCT_UNINST_KEY}" "UninstallString"
    StrCmp $R2 "" NO YES
    YES:
        MessageBox MB_ICONQuESTION|MB_YESNO "The installer detected that Samurai is running. Need to stop and uninstall it to proceed with the new installation. Do you want to uninstall it now?" IDYES keep IDNO none
    keep:
        ExecWait $R2

    none:
        Quit
    NO:
SectionEnd

Section "MainSection" SEC01
    SetOutPath "$INSTDIR"
    SetOverwrite ifnewer
    File "..\dist\win-unpacked\Samurai.exe"
    CreateDirectory "$SMPROGRAMS\Samurai"
    CreateShortCut "$SMPROGRAMS\Samurai\Samurai.lnk" "$INSTDIR\Samurai.exe"
    CreateShortCut "$DESKTOP\Samurai.lnk" "$INSTDIR\Samurai.exe"
    File /r "..\dist\win-unpacked\*.*"
SectionEnd

Section -AdditionalIcons
    WriteIniStr "$INSTDIR\${PRODUCT_NAME}.url" "InternetShortcut" "URL" "${PRODUCT_WEB_SITE}"
    CreateShortCut "$SMPROGRAMS\Samurai\Website.lnk" "$INSTDIR\${PRODUCT_NAME}.url"
    CreateShortCut "$SMPROGRAMS\Samurai\Uninstall.lnk" "$INSTDIR\uninst.exe"
SectionEnd

Section -Post
    WriteUninstaller "$INSTDIR\uninst.exe"
    WriteRegStr HKLM "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\Samurai.exe"
    WriteRegStr HKLM "${PRODUCT_DIR_REGKEY}" "Version" "${PRODUCT_VERSION}"
    WriteRegStr HKLM "${PRODUCT_DIR_REGKEY}" "UserDataPath" "$0"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayName" "$(^Name)"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninst.exe"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\Samurai.exe"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
SectionEnd

Section "SectionA" SecA
    ReadINIStr $0 "$PLUGINSDIR\setup.ini" "Field 2" State
    ; MessageBox MB_OK "The location to store block data and the keystore file:$0"
SectionEnd

Function .Oninit
  InitPluginsDir
  File /oname=$PLUGINSDIR\setup.ini ".\setup.ini"
FunctionEnd

;Function .onInstSuccess
;  ReadINIStr $0 "$PLUGINSDIR\setup.ini" "Field 2" State
;   MessageBox MB_OK "�洢PlatON�������ݼ�Keystore�ļ���2222λ��Ϊ��$0"
;   FileOpen $1 "C:\test\test.txt" w
;   FileWrite $1 'load("test.il" "test")\r$\n'
;   FileClose $1
; FunctionEnd

Function SetCustom
; �жϹ�ѡ�����������δ��ѡ����İ�װ·���ؼ���Ϊ������
  SectionGetFlags ${SecA} $0
  StrCmp $0 0 0 +2
    WriteINIStr "$PLUGINSDIR\setup.ini" "Field 2" "Flags" "Disabled"
  StrCmp $0 1 0 +2   ; ��������ѡ�ˣ�����Ҫȥ�� Disabled�������д��벻��ʡ��
    WriteINIStr "$PLUGINSDIR\setup.ini" "Field 2" "Flags" "Disabled"

; Ԥ���������װ·��
  WriteINIStr "$PLUGINSDIR\setup.ini" "Field 2" "State" "$APPDATA\Samurai"

  InstallOptions::initDialog /NOUNLOAD "$PLUGINSDIR\setup.ini"
  !insertmacro MUI_HEADER_TEXT "Please select a location to store the block data and the keystore file." ""
  InstallOptions::show
  Pop $R0

FunctionEnd

Function LeaveCustom

  ReadINIStr $0 "$PLUGINSDIR\setup.ini" "Field 2" "State"
  StrCmp $0 "" +2
  ; �ж��û������·���Ƿ�Ϸ���
;   IfFileExists "$0\*" +3
;       MessageBox MB_OK|MB_ICONSTOP "Invalid path!"
;       Abort

FunctionEnd


/******************************
 *  �����ǰ�װ�����ж�ز���  *
 ******************************/

; ���ݰ�װ��־ж���ļ��ĵ��ú�
!macro DelFileByLog LogFile
  ifFileExists `${LogFile}` 0 +4
    Push `${LogFile}`
    Call un.DelFileByLog
    Delete `${LogFile}`
!macroend

Section Uninstall
  Delete "$INSTDIR\${PRODUCT_NAME}.url"

  ; ���ú�ֻ���ݰ�װ��־ж�ذ�װ�����Լ���װ�����ļ�
  !insertmacro DelFileByLog "$INSTDIR\install.log"

  ; �����װ���򴴽�������ж��ʱ����Ϊ�յ���Ŀ¼�����ڵݹ���ӵ��ļ�Ŀ¼���������ڲ����Ŀ¼��ʼ���(ע�⣬��Ҫ�� /r �����������ʧȥ DelFileByLog ������)
  RMDir "$SMPROGRAMS\Samurai"
  RMDir "$INSTDIR\resources\app.asar.unpacked"
  RMDir "$INSTDIR\resources"
  RMDir "$INSTDIR\Samurai_exe"
  RMDir "$INSTDIR\locales"

  RMDir "$INSTDIR"

  DeleteRegKey ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}"
  DeleteRegKey HKLM "${PRODUCT_DIR_REGKEY}"
  SetAutoClose true
SectionEnd

#-- ���� NSIS �ű��༭�������� Function ���α�������� Section ����֮���д���Ա��ⰲװ�������δ��Ԥ֪�����⡣--#

Function un.onInit
  MessageBox MB_ICONQUESTION|MB_YESNO|MB_DEFBUTTON2 "Are you sure you want to completely remove $(^Name) and all its components?" IDYES +2
  Abort
  ;�������Ƿ�����
  FindProcDLL::FindProc "Samurai.exe"
   Pop $R0
   IntCmp $R0 1 0 no_run
   MessageBox MB_ICONSTOP "ж�س����⵽ ${PRODUCT_NAME} �������У���ر�֮����ж�أ�"
   Quit
   no_run:
FunctionEnd

Function un.onUninstSuccess
  MessageBox MB_ICONINFORMATION|MB_OK "Opening leftover data directories(backup before deleting!)" IDOK ok
  ok:
    ExecShell explore "$APPDATA\Samurai"
FunctionEnd

; ������ж�س���ͨ����װ��־ж���ļ���ר�ú������벻Ҫ�����޸�
Function un.DelFileByLog
  Exch $R0
  Push $R1
  Push $R2
  Push $R3
  FileOpen $R0 $R0 r
  ${Do}
    FileRead $R0 $R1
    ${IfThen} $R1 == `` ${|} ${ExitDo} ${|}
    StrCpy $R1 $R1 -2
    StrCpy $R2 $R1 11
    StrCpy $R3 $R1 20
    ${If} $R2 == "File: wrote"
    ${OrIf} $R2 == "File: skipp"
    ${OrIf} $R3 == "CreateShortCut: out:"
    ${OrIf} $R3 == "created uninstaller:"
      Push $R1
      Push `"`
      Call un.DelFileByLog.StrLoc
      Pop $R2
      ${If} $R2 != ""
        IntOp $R2 $R2 + 1
        StrCpy $R3 $R1 "" $R2
        Push $R3
        Push `"`
        Call un.DelFileByLog.StrLoc
        Pop $R2
        ${If} $R2 != ""
          StrCpy $R3 $R3 $R2
          Delete /REBOOTOK $R3
        ${EndIf}
      ${EndIf}
    ${EndIf}
    StrCpy $R2 $R1 7
    ${If} $R2 == "Rename:"
      Push $R1
      Push "->"
      Call un.DelFileByLog.StrLoc
      Pop $R2
      ${If} $R2 != ""
        IntOp $R2 $R2 + 2
        StrCpy $R3 $R1 "" $R2
        Delete /REBOOTOK $R3
      ${EndIf}
    ${EndIf}
  ${Loop}
  FileClose $R0
  Pop $R3
  Pop $R2
  Pop $R1
  Pop $R0
FunctionEnd

Function un.DelFileByLog.StrLoc
  Exch $R0
  Exch
  Exch $R1
  Push $R2
  Push $R3
  Push $R4
  Push $R5
  StrLen $R2 $R0
  StrLen $R3 $R1
  StrCpy $R4 0
  ${Do}
    StrCpy $R5 $R1 $R2 $R4
    ${If} $R5 == $R0
    ${OrIf} $R4 = $R3
      ${ExitDo}
    ${EndIf}
    IntOp $R4 $R4 + 1
  ${Loop}
  ${If} $R4 = $R3
    StrCpy $R0 ""
  ${Else}
    StrCpy $R0 $R4
  ${EndIf}
  Pop $R5
  Pop $R4
  Pop $R3
  Pop $R2
  Pop $R1
  Exch $R0
FunctionEnd
