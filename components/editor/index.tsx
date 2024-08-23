"use client"
import React, { useEffect } from 'react';
import Editor, { useMonaco } from "@monaco-editor/react";
import configureCadence from "./cadence"
import { useTheme } from "next-themes"
import { cn } from '@/lib/utils';
//import {CadenceDocgen} from "@onflow/cadence-docgen"


function setEditorReadOnly(readOnly) {
  return (editor, monaco)=>{
    editor.updateOptions({ readOnly: readOnly })
    editor.updateOptions({ scrollBeyondLastLine: false });

    // link handling
    if (location.hash.substring(0,2)=="#L") {
        var lines =location.hash.substring(2).split("-")
        var startLine = parseInt(lines[0])
        var endLine = startLine
        if (lines.length==2){
            endLine = parseInt(lines[1])
        }
        var line = parseInt(location.hash.substring(2))
        if (line > 0) {
            editor.createDecorationsCollection([
                {
                    range: new monaco.Range(startLine, 1, endLine, 1000),
                    options: {inlineClassName: "lineLinkHighlight"},
                },
            ]);

            const element = document.querySelector("div[data-mode-id='cadence']")
            const rect = element.getBoundingClientRect() // get rects(width, height, top, etc)
            const viewHeight = window.innerHeight;
            window.scroll({
                top: rect.top + line * 21 - viewHeight / 2,
                behavior: 'smooth' // smooth scroll
            });

            editor.revealLine(line)
        }
    }

      editor.addAction({
          // An unique identifier of the contributed action.
          id: "copy-link",

          // A label of the action that will be presented to the user.
          label: "Copy link",

          // An optional array of keybindings for the action.
          keybindings: [
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.F10,
              // chord
              monaco.KeyMod.chord(
                  monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK,
                  monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM
              ),
          ],

          // A precondition for this action.
          precondition: null,

          // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
          keybindingContext: null,

          contextMenuGroupId: "navigation",

          contextMenuOrder: 1.5,

          run: function (ed) {
              var sel = ed.getSelection()
              location.hash = '#L' + sel.startLineNumber
              if (sel.startLineNumber!=sel.endLineNumber){
                  location.hash = location.hash + "-" + sel.endLineNumber
              }
              navigator.clipboard.writeText(location.toString());
              window.location.reload()
          },
      });


    //}, 1000);
  }
}

export default function CadenceEditor({prefix="", type="", index=0, code = "", onChange = null, name = "RAWR", lang="cadence", className="" }) {
  const monaco  = useMonaco();
  const { theme } = useTheme();

  async function loadDocgen () {
    // const docgen = await CadenceDocgen.create("cadence-docgen.wasm")
    // const docs = docgen.generate(`
    //   /// This is a simple function with a doc-comment.
    //   pub fun hello() {
    //   }
    // `)
    // console.log("DOCS", docs);
  }

  useEffect(() => {
    if (!monaco) return
      //loadDocgen()


      configureCadence(monaco)
    console.log("theme", theme)
     //disable search
      monaco.editor.addKeybindingRule({
          keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF,
          command: null
      });

    monaco.editor.defineTheme('cb', {
      base: `${theme === 'light' ? "vs" : "vs-dark"}`,
      inherit: true,
      colors: {
        "editor.background": `${theme === 'light' ? "#ffffff" : "#020815"}`,
      },
      rules: []
    });
    monaco.editor.setTheme('cb');

  }, [monaco, theme]);

  return (
    <Editor
      language="cadence"
      theme="cb"
      className={cn("border rounded-lg overflow-hidden ", className)}
      options={{
          fontSize: 14,
          selectionHighlight: false,
          padding: {
              top: 16,
              bottom: 16,
            },
          scrollBeyondLastLine: false,
          minimap: { enabled: false },
          scrollbar:{
            alwaysConsumeMouseWheel: false,
          },
      }}
      value={code}
      height={(code.split('\n').length+3)*21}
      onChange={onChange}
      onMount={onChange ? setEditorReadOnly(false) : setEditorReadOnly(true)}
    />
  )
}