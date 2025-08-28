import z from 'zod'
import { useState } from 'react'
import { Button } from './components/ui/button'
import { Textarea } from './components/ui/textarea'
//{"messages": [{"role": "user", "content": "Hey there! How are you doing today?"}, {"role": "assistant", "content": "Oh! H-hi there... :3 I'm doing okay, I guess? Just been kinda quiet today, hehe... How are you? I hope you're having a better day than me... >.<"}]}
export const JsonDataSchema = z.array(z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(2).max(1000)
  }))
}))

export default function LoadJsonl({ setJsonl }: { setJsonl: (data: z.infer<typeof JsonDataSchema>) => void }) {
    const [jsonData, setJsonData] = useState<string>()

  return (
    <div className='flex flex-col items-center justify-center'>
      <Textarea
        rows={10}
        cols={50}
        wrap='off'
        placeholder='Paste your JSONL data here...'
        onChange={(e) => {
          setJsonData(e.target.value)
        }}
      />
      <Button onClick={() => {
        if (jsonData) {
          const processed = jsonData.split('\n').map(line => {
            try {
              return JSON.parse(line)
            } catch {
              return null
            }
          }).filter(Boolean);
          const parsed = JsonDataSchema.parse(processed);
          setJsonl(parsed);
        }
      }}>Submit</Button>
    </div>
  )
}
