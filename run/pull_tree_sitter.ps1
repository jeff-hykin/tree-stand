#!/usr/bin/env sh
"\"",`$(echo --% ' |out-null)" >$null;function :{};function dv{<#${/*'>/dev/null )` 2>/dev/null;dv() { #>
echo "1.42.1"; : --% ' |out-null <#'; }; version="$(dv)"; deno="$HOME/.deno/$version/bin/deno"; if [ -x "$deno" ]; then  exec "$deno" run -q -A --no-lock "$0" "$@";  elif [ -f "$deno" ]; then  chmod +x "$deno" && exec "$deno" run -q -A --no-lock "$0" "$@";  fi; bin_dir="$HOME/.deno/$version/bin"; exe="$bin_dir/deno"; has () { command -v "$1" >/dev/null; } ;  if ! has unzip; then if ! has apt-get; then  has brew && brew install unzip; else  if [ "$(whoami)" = "root" ]; then  apt-get install unzip -y; elif has sudo; then  echo "Can I install unzip for you? (its required for this command to work) ";read ANSWER;echo;  if [ "$ANSWER" = "y" ] || [ "$ANSWER" = "yes" ] || [ "$ANSWER" = "Y" ]; then  sudo apt-get install unzip -y; fi; elif has doas; then  echo "Can I install unzip for you? (its required for this command to work) ";read ANSWER;echo;  if [ "$ANSWER" = "y" ] || [ "$ANSWER" = "yes" ] || [ "$ANSWER" = "Y" ]; then  doas apt-get install unzip -y; fi; fi;  fi;  fi;  if ! has unzip; then  echo ""; echo "So I couldn't find an 'unzip' command"; echo "And I tried to auto install it, but it seems that failed"; echo "(This script needs unzip and either curl or wget)"; echo "Please install the unzip command manually then re-run this script"; exit 1;  fi;  repo="denoland/deno"; if [ "$OS" = "Windows_NT" ]; then target="x86_64-pc-windows-msvc"; else :;  case $(uname -sm) in "Darwin x86_64") target="x86_64-apple-darwin" ;; "Darwin arm64") target="aarch64-apple-darwin" ;; "Linux aarch64") repo="LukeChannings/deno-arm64" target="linux-arm64" ;; "Linux armhf") echo "deno sadly doesn't support 32-bit ARM. Please check your hardware and possibly install a 64-bit operating system." exit 1 ;; *) target="x86_64-unknown-linux-gnu" ;; esac; fi; deno_uri="https://github.com/$repo/releases/download/v$version/deno-$target.zip"; exe="$bin_dir/deno"; if [ ! -d "$bin_dir" ]; then mkdir -p "$bin_dir"; fi;  if ! curl --fail --location --progress-bar --output "$exe.zip" "$deno_uri"; then if ! wget --output-document="$exe.zip" "$deno_uri"; then echo "Howdy! I looked for the 'curl' and for 'wget' commands but I didn't see either of them. Please install one of them, otherwise I have no way to install the missing deno version needed to run this code"; exit 1; fi; fi; unzip -d "$bin_dir" -o "$exe.zip"; chmod +x "$exe"; rm "$exe.zip"; exec "$deno" run -q -A --no-lock "$0" "$@"; #>}; $DenoInstall = "${HOME}/.deno/$(dv)"; $BinDir = "$DenoInstall/bin"; $DenoExe = "$BinDir/deno.exe"; if (-not(Test-Path -Path "$DenoExe" -PathType Leaf)) { $DenoZip = "$BinDir/deno.zip"; $DenoUri = "https://github.com/denoland/deno/releases/download/v$(dv)/deno-x86_64-pc-windows-msvc.zip";  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;  if (!(Test-Path $BinDir)) { New-Item $BinDir -ItemType Directory | Out-Null; };  Function Test-CommandExists { Param ($command); $oldPreference = $ErrorActionPreference; $ErrorActionPreference = "stop"; try {if(Get-Command "$command"){RETURN $true}} Catch {Write-Host "$command does not exist"; RETURN $false}; Finally {$ErrorActionPreference=$oldPreference}; };  if (Test-CommandExists curl) { curl -Lo $DenoZip $DenoUri; } else { curl.exe -Lo $DenoZip $DenoUri; };  if (Test-CommandExists curl) { tar xf $DenoZip -C $BinDir; } else { tar -Lo $DenoZip $DenoUri; };  Remove-Item $DenoZip;  $User = [EnvironmentVariableTarget]::User; $Path = [Environment]::GetEnvironmentVariable('Path', $User); if (!(";$Path;".ToLower() -like "*;$BinDir;*".ToLower())) { [Environment]::SetEnvironmentVariable('Path', "$Path;$BinDir", $User); $Env:Path += ";$BinDir"; } }; & "$DenoExe" run -q -A --no-lock "$PSCommandPath" @args; Exit $LastExitCode; <# 
# */0}`;
import { FileSystem } from "https://deno.land/x/quickr@0.6.44/main/file_system.js"
import { Console, bold, lightRed, yellow } from "https://deno.land/x/quickr@0.6.44/main/console.js"
import { run, Timeout, Env, Cwd, Stdin, Stdout, Stderr, Out, Overwrite, AppendTo, throwIfFails, returnAsString, zipInto, mergeInto } from "https://deno.land/x/quickr@0.6.44/main/run.js"
import $ from "https://deno.land/x/dax@0.39.2/mod.ts"
import { pureBinaryify } from "https://deno.land/x/binaryify@2.4.1.0/tools.js"

const deno = Deno.execPath()

// TODO: the following has been hand-done but needs to be automated:
    // rename Node to HardNode
    // make HardNode extend Node

    // - see git tag "prev_hand_modified_commit"
    // - handle enumerable/configurable/writable: true
    // - replace parse args with parse(inputString, previousTree, options)
    // - n.parser = this at the bottom of parse() in ParserImpl 
    
    // - extract out of function
    // - set ENVIRONMENT_IS_NODE=true
    // - set ENVIRONMENT_IS_WEB=false
    // - set ENVIRONMENT_IS_WORKER=false
    // - var Module, initPromise
    // - delete nodePath = Z("path"), change the import
    // - delete nodePath = Z("fs"), change the import
    // - WORKS^

    // - extract out of promise
    // - var Module = {}, // no initPromise
    // - put "for (let e of Object.getOwnPropertyNames"... below parser class
    // - fix the initPromise next to "ParserImpl.init()" in the Module.onRuntimeInitialized
    // - keep the Object.assign({}, Module) in the moduleOverrides
    // - ALSO WORKS^

    // - add constructor to class ParserImpl
    // - add if (firstTime) check to ParserImpl init()
    // - remove "for (let e of Object.getOwnPropertyNames"... below parser class
    // - remove "ENVIRONMENT_IS_NODE" check, remove the else (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) 
    // - export class Tree
    // - export class Node
    // - export class TreeCursor
    // - export class Language
    // - export class LookaheadIterable
    // - export class Query
    // - delete class Parser
    // - rename class ParserImpl to Parser and export
    // - ALSO WORKS^

const treeSitterWasmPath = `${FileSystem.thisFolder}/../tree_sitter_code/tree-sitter.wasm`
const treeSitterJsifyedWasmPath = `${FileSystem.thisFolder}/../generated/tree_sitter.wasm.binaryified.js`

// const currentMasterCode = await (await fetch(`https://raw.githubusercontent.com/tree-sitter/tree-sitter/refs/heads/master/lib/binding_web/binding.js`)).text()
import { binaryify } from "https://deno.land/x/binaryify@2.5.3.0/binaryify_api.js"
let promises = []
promises.push(
    binaryify({
        pathToBinary: treeSitterWasmPath,
        pathToBinarified: treeSitterJsifyedWasmPath,
    })
)
const combinedCode = (await Promise.all([
    FileSystem.read( `${FileSystem.thisFolder}/../shim_code/shim.js` ),
    FileSystem.read( `${FileSystem.thisFolder}/../tree_sitter_code/external_wasm_interface.js` ),
    FileSystem.read( `${FileSystem.thisFolder}/../tree_sitter_code/binding.js` ),
    FileSystem.read( `${FileSystem.thisFolder}/../tree_sitter_code/custom_postfix.js` ),
])).join("\n// -------------\n\n")


await FileSystem.write({
    path: `${FileSystem.thisFolder}/../generated/tree_sitter.js`,
    data: combinedCode,
})

// (this comment is part of deno-guillotine, dont remove) #>