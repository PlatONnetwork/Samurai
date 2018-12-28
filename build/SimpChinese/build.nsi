; 该脚本使用 HM VNISEdit 脚本编辑器向导产生

!include "LogicLib.nsh"

; 安装程序初始定义常量
!define PRODUCT_NAME "Samurai"
!define PRODUCT_VERSION ""; 加版本号，开头多加一个空格！
!define PRODUCT_PUBLISHER "www.platon.network<support@platon.network>"
!define PRODUCT_WEB_SITE "https://www.platon.network"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\Samurai.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKLM"

SetCompressor lzma

; ------ MUI 现代界面定义 (1.67 版本以上兼容) ------
!include "MUI.nsh"

; MUI 预定义常量
!define MUI_ABORTWARNING
!define MUI_ICON "icons\icon.ico"
!define MUI_UNICON "icons\icon.ico"
!define MUI_WELCOMEFINISHPAGE_BITMAP "icons\bg.bmp"

; 欢迎页面
!insertmacro MUI_PAGE_WELCOME
; 许可协议页面
!define MUI_LICENSEPAGE_CHECKBOX
!insertmacro MUI_PAGE_LICENSE "softwareLicence.txt"
; 安装目录选择页面
!insertmacro MUI_PAGE_DIRECTORY

Page custom SetCustom LeaveCustom  ;自定义窗口，选择数据目录
; 安装过程页面
!insertmacro MUI_PAGE_INSTFILES
; 安装完成页面
!define MUI_FINISHPAGE_RUN "$INSTDIR\Samurai.exe"
!insertmacro MUI_PAGE_FINISH

; 安装卸载过程页面
!insertmacro MUI_UNPAGE_INSTFILES

; 安装界面包含的语言设置
!insertmacro MUI_LANGUAGE "SimpChinese"

; 安装预释放文件
!insertmacro MUI_RESERVEFILE_INSTALLOPTIONS
; ------ MUI 现代界面定义结束 ------

Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "..\dist\${PRODUCT_NAME}-windows-amd64${PRODUCT_VERSION}.exe"
InstallDir "$PROGRAMFILES\Samurai"
InstallDirRegKey HKLM "${PRODUCT_UNINST_KEY}" "UninstallString"
ShowInstDetails show
ShowUnInstDetails show

; 激活安装日志记录，该日志文件将会作为卸载文件的依据(注意，本区段必须放置在所有区段之前)
Section "-LogSetOn"
  LogSet on
SectionEnd

Section "Samurai"
ReadRegStr $R2 HKLM "${PRODUCT_UNINST_KEY}" "UninstallString"
    StrCmp $R2 "" NO YES
    YES:
        MessageBox MB_ICONQuESTION|MB_YESNO "安装程序检测到 Samurai 正在运行，您必须将其卸载才能进行下一步安装，是否现在进行卸载？" IDYES keep IDNO none
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
    ; MessageBox MB_OK "存储PlatON区块数据及Keystore文件的位置为：$0"
SectionEnd

Function .Oninit
  InitPluginsDir
  File /oname=$PLUGINSDIR\setup.ini ".\setup.ini"
FunctionEnd

;Function .onInstSuccess
;  ReadINIStr $0 "$PLUGINSDIR\setup.ini" "Field 2" State
;   MessageBox MB_OK "存储PlatON区块数据及Keystore文件的2222位置为：$0"
;   FileOpen $1 "C:\test\test.txt" w
;   FileWrite $1 'load("test.il" "test")\r$\n'
;   FileClose $1
; FunctionEnd

Function SetCustom
; 判断勾选的组件，并把未勾选组件的安装路径控件设为不可用
  SectionGetFlags ${SecA} $0
  StrCmp $0 0 0 +2
    WriteINIStr "$PLUGINSDIR\setup.ini" "Field 2" "Flags" "Disabled"
  StrCmp $0 1 0 +2    ; 如果组件勾选了，还需要去掉 Disabled，这两行代码不能省略
    WriteINIStr "$PLUGINSDIR\setup.ini" "Field 2" "Flags" ""

; 预定义组件安装路径
  WriteINIStr "$PLUGINSDIR\setup.ini" "Field 2" "State" "$APPDATA\Samurai"

  InstallOptions::initDialog /NOUNLOAD "$PLUGINSDIR\setup.ini"
  !insertmacro MUI_HEADER_TEXT "请选择存储区块数据及Keystore文件的位置" ""
  InstallOptions::show
  Pop $R0

FunctionEnd

Function LeaveCustom

  ReadINIStr $0 "$PLUGINSDIR\setup.ini" "Field 2" "State"
  StrCmp $0 "" +2
  ; 判断用户输入的路径是否合法。
;   IfFileExists "$0\*" +3
;       MessageBox MB_OK|MB_ICONSTOP "存储区块数据及Keystore文件的路径无效！"
;       Abort

FunctionEnd


/******************************
 *  以下是安装程序的卸载部分  *
 ******************************/

; 根据安装日志卸载文件的调用宏
!macro DelFileByLog LogFile
  ifFileExists `${LogFile}` 0 +4
    Push `${LogFile}`
    Call un.DelFileByLog
    Delete `${LogFile}`
!macroend

Section Uninstall
  Delete "$INSTDIR\${PRODUCT_NAME}.url"

  ; 调用宏只根据安装日志卸载安装程序自己安装过的文件
  !insertmacro DelFileByLog "$INSTDIR\install.log"

  ; 清除安装程序创建的且在卸载时可能为空的子目录，对于递归添加的文件目录，请由最内层的子目录开始清除(注意，不要带 /r 参数，否则会失去 DelFileByLog 的意义)
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

#-- 根据 NSIS 脚本编辑规则，所有 Function 区段必须放置在 Section 区段之后编写，以避免安装程序出现未可预知的问题。--#

Function un.onInit
  MessageBox MB_ICONQUESTION|MB_YESNO|MB_DEFBUTTON2 "您确实要完全移除 $(^Name) ，及其所有的组件？" IDYES +2
  Abort
FunctionEnd

Function un.onUninstSuccess
  HideWindow
  MessageBox MB_ICONINFORMATION|MB_OK "$(^Name) 已成功地从您的计算机移除。"
FunctionEnd

; 以下是卸载程序通过安装日志卸载文件的专用函数，请不要随意修改
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
