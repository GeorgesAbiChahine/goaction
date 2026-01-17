import { TableView } from "@/components/table-view"

const Files = () => {
  return (
    <div className="flex flex-col w-full max-w-4xl h-full mx-auto">
      <div className="text-4xl mb-5 font-(family-name:--font-instrument-serif)">Files</div>
      <TableView />
    </div>
  )
}

export default Files