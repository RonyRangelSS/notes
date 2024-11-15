import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'
interface newNoteCardProps {
    onNoteCreated: (content: string) => void
}

export function NewNoteCard({onNoteCreated}: newNoteCardProps) {
    const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
    const [content, setContent] = useState('')
    const [isRecording, setIsRecording] = useState(false)

    function handleStartEditor() {
        setShouldShowOnboarding(false)
    }
    function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
        setContent(event.target.value)

        if (event.target.value === '') {
            setShouldShowOnboarding(true)
        }
    }
    function handleSaveNote(event: FormEvent) {
        event.preventDefault()
        if (content === '') {
            return
        }
        onNoteCreated(content)
        setShouldShowOnboarding(true)
        setContent('')
        toast.success('Nota criada com sucesso')

    }

    let speechRecognition: SpeechRecognition | null = null

    function handleStartRecording() {
        
        const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
        if (!isSpeechRecognitionAPIAvailable) {
            alert('Infelizmente seu navegador não suporta a API de gravação')
            return
        }
        
        setIsRecording(true)
        setShouldShowOnboarding(false)

        const speechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

        speechRecognition = new speechRecognitionAPI()

        speechRecognition.lang = 'pt-BR'
        speechRecognition.continuous = true
        speechRecognition.maxAlternatives = 1
        speechRecognition.interimResults = true

        speechRecognition.onresult = (event) => {
            const transcription = Array.from(event.results).reduce((text, result) => {
                return text.concat(result[0].transcript)
            }, "")
            setContent(transcription)
        }
        speechRecognition.onerror = (event) => {
            console.error(event)
        }
        speechRecognition.start()

    }

    function stopRecording() {
        setIsRecording(false)

        if (speechRecognition !== null) {
            speechRecognition.stop()
        }
    }

    return (
        <Dialog.Root>
        <Dialog.Trigger className='rounded-md flex flex-col bg-slate-700 p-5 text-left gap-3 hover:ring-2 outline-none hover:ring-slate-600 focus:ring-2 focus-visible:ring-line-400 '>
          <span className='text-sm font-medium text-slate-200'>
            Adicionar nota
          </span>
          <p className='text-sm leading-6 text-slate-400'>Grave uma nota em áudio que será convertida para texto automaticamente</p>
        </Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Overlay className='inset-0 fixed bg-black/60'/>
            <Dialog.Content className='fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[640px] w-full h-[60vh] bg-slate-700 flex flex-col outline-none'>
                
                <Dialog.Close className='absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100 '>
                    <X className='size-5'/>
                </Dialog.Close>
                <div className='flex-1 flex flex-col'>
                <div className='flex flex-1 flex-col gap-3 p-5 '>
                <span className='text-sm font-medium text-slate-200'>
                    Adicionar nota
                </span>
                {shouldShowOnboarding ? (
                    <p className='text-sm leading-6 text-slate-400'>
                    Comece <button onClick={handleStartRecording} className='text-lime-400 hover:underline font-medium'>gravando uma nota em áudio</button> ou se preferir <button onClick={handleStartEditor} className='text-lime-400 hover:underline font-medium'>utilize apenas texto.</button>
                </p>):
                <textarea autoFocus value={content} onChange={handleContentChange} className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'/>
                }
                </div>
                <form action='' onSubmit={handleSaveNote}>
                {isRecording ?
                (<button type='button' onClick={stopRecording} className='w-full flex items-center justify-center gap-3 bg-slate-800 py-4 text-center text-sm text-slate-300 outline-none font-medium group hover:text-slate-100'>
                <div className='size-3 bg-red-500 rounded-full animate-pulse '/>
                Gravando! (Clique para interromper)
                </button>):
                (<button type='button' onClick={handleSaveNote}  className='w-full bg-lime-400 py-4 text-center text-sm text-slate-950 outline-none font-medium group hover:bg-lime-500'>
                Salvar nota
                </button>)}
                </form>
                </div>

    
            </Dialog.Content>
        </Dialog.Portal>
        </Dialog.Root>
    )
}