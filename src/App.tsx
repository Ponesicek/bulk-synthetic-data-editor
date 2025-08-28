import { useState } from 'react'
import './App.css'
import { JsonDataSchema } from './loadJsonl'
import LoadJsonl from './loadJsonl'
import z from 'zod'
import { DataTable } from './components/data-table'
import { columns } from './components/column'

function App() {
  const [jsonlData, setJsonlData] = useState<z.infer<typeof JsonDataSchema> | undefined>()

  return (
    <div className='mx-auto flex min-h-screen flex-col pt-1'>
      <h1 className='text-2xl font-bold'>Welcome to FineTuneEditor</h1>
      <p className='mt-4 text-lg'>Your go-to solution for fine-tuning language models.</p>
      <LoadJsonl setJsonl={setJsonlData} />
      {jsonlData && <DataTable columns={columns} data={jsonlData} />}
    </div>
  )
}

export default App
