"use client"

import { useEffect, useRef } from 'react';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';


// Define an interface for our editor reference to avoid TypeScript errors
interface CodeMirrorEditor {
  toTextArea: () => void;
  setSize: (width: any, height: any) => void;
  setValue:(code:any) => void;
  on: (action: string, callback: (instance: any, changes: any) => void) => any;
}

// Create Editor component with proper client-side initialization
export default function  Editor({socketRef,roomId,onCodeChange}:any) {
  const editorRef = useRef<CodeMirrorEditor | null>(null);
  const editorInitialized = useRef(false);
  
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Prevent multiple initializations
    if (editorInitialized.current) return;
    
    const initCodeMirror = async () => {
      try {
        // Dynamically import CodeMirror and its dependencies
        const CodeMirror = (await import('codemirror')).default;
        await import('codemirror/mode/javascript/javascript');
        await import('codemirror/addon/edit/closetag');
        await import('codemirror/addon/edit/closebrackets');
        
        const textArea = document.getElementById('realTimeEditor') as HTMLTextAreaElement;
        
        if (textArea) {
          const editor = CodeMirror.fromTextArea(textArea, {
            mode: { name: "javascript", json: true },
            theme: "dracula",
            autoCloseTags: true,
            autoCloseBrackets: true,
            lineNumbers: true,
          });
          
          editor.setSize(null, '100%');
          editorRef.current = editor;
          editorInitialized.current = true;

          editorRef.current.on('change',(instance,changes)=>{
            const {origin} = changes;
            const code  = instance.getValue();
            onCodeChange(code);
            if(origin !== 'setValue'){
              socketRef.current.emit('code-change',{
                roomId, code,
              })
            }
          })
        }
      } catch (error) {
        console.error("Error initializing CodeMirror:", error);
      }
    };
    
    initCodeMirror();
    
    // Cleanup function
    return () => {
      if (editorRef.current) {
        editorRef.current.toTextArea();
        editorRef.current = null;
        editorInitialized.current = false;
      }
    };
  }, []);

  useEffect(()=>{
    if(socketRef.current){
      socketRef.current.on('code-change',({code}:any)=>{
        if(code!==null){
          editorRef.current?.setValue(code);
        }
      });
      socketRef.current.on('code-change-again', ({ code }: any) => {
        if (code !== null) {
            setTimeout(() => {
                if (editorRef.current) {
                    editorRef.current.setValue(code);
                }
            }, 600);
        }
    });
    }

    return ()=>{
      socketRef.current.off('code-change');
      socketRef.current?.off('code-change-again');
    }
  },[socketRef.current,editorRef.current])
  
  return (
    <div className="h-full bg-gray-800 overflow-hidden flex flex-col">
      <div className="flex-1 w-full">
        <textarea 
          id="realTimeEditor" 
          name="realTimeEditor" 
          className="w-full h-full p-4"
          
        ></textarea>
      </div>
    </div>
  );
}